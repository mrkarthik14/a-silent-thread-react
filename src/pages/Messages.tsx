import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { motion } from "framer-motion";
import { Loader2, Send, Search, UserPlus, MessageCircle, Paperclip, Smile, X, ImageIcon, Video, FileText, Heart, Trash2, Eye, Phone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router";
import { UserSearch } from "@/components/UserSearch";
import { CallIndicator } from "@/components/CallIndicator";

export default function Messages() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    (location.state as any)?.selectedUserId || null
  );
  const [message, setMessage] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track presence
  usePresence();
  
  const conversations = useQuery(api.messages.getConversations, {});
  const currentConversation = useQuery(
    api.messages.getConversation,
    selectedUserId ? { userId: selectedUserId } : "skip"
  );
  const isOtherUserTyping = useQuery(
    api.typingIndicators.getTypingStatus,
    selectedUserId ? { userId: selectedUserId } : "skip"
  );
  
  // Get presence for selected user
  const selectedUserPresence = useQuery(
    api.presence.getUserPresence,
    selectedUserId ? { userId: selectedUserId } : "skip"
  );
  
  // Get selected user data and image
  const selectedUserConv = conversations?.find(c => c.user?._id === selectedUserId);
  const selectedUserImage = useQuery(
    api.files.getImageUrl,
    selectedUserConv?.user?.image ? { storageId: selectedUserConv.user.image } : "skip"
  );
  
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typingIndicators.setTyping);
  const clearTyping = useMutation(api.typingIndicators.clearTyping);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const hideMessage = useMutation(api.messages.hideMessage);
  const likeMessage = useMutation(api.messages.likeMessage);
  const unlikeMessage = useMutation(api.messages.unlikeMessage);
  const addReaction = useMutation(api.messages.addReaction);
  const removeReaction = useMutation(api.messages.removeReaction);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation]);

  // Clear typing indicator on unmount or when changing conversations
  useEffect(() => {
    return () => {
      if (selectedUserId) {
        clearTyping({ recipientId: selectedUserId });
      }
    };
  }, [selectedUserId, clearTyping]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleTyping = (value: string) => {
    setMessage(value);
    
    if (!selectedUserId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing indicator
    if (value.trim()) {
      setTyping({ recipientId: selectedUserId, isTyping: true });

      // Clear typing indicator after 3 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        clearTyping({ recipientId: selectedUserId });
      }, 3000);
    } else {
      clearTyping({ recipientId: selectedUserId });
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedUserId) return;

    try {
      // Clear typing indicator
      await clearTyping({ recipientId: selectedUserId });
      
      await sendMessage({
        recipientId: selectedUserId,
        content: message,
      });
      setMessage("");
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setUploadProgress(0);
      toast.info("Upload cancelled");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserId) return;

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 50MB limit");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      const uploadUrl = await generateUploadUrl();
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          const { storageId } = JSON.parse(xhr.responseText);
          await sendMessage({
            recipientId: selectedUserId,
            content: `Shared a file: ${file.name}`,
            messageType: "file",
            mediaUrl: storageId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
          toast.success("File uploaded successfully");
          setIsUploading(false);
          setUploadProgress(0);
        }
      });

      xhr.addEventListener("error", () => {
        toast.error("Upload failed");
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener("abort", () => {
        toast.info("Upload cancelled");
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (error) {
      toast.error("Failed to upload file");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 flex ml-0 md:ml-20">
        <div className="w-80 border-r border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">Messages</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSearchDialogOpen(true)}
              className="rounded-xl hover:bg-purple-100/50"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-73px)] conversations-scroll bg-white/30">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <motion.div
                  key={conv.user?._id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedUserId(conv.user?._id || null)}
                  className={`p-4 cursor-pointer border-b border-slate-200 hover:bg-purple-50/50 transition-colors ${
                    selectedUserId === conv.user?._id ? "bg-purple-100/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={conv.user?.image} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-200 to-blue-200">
                          {conv.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate text-slate-900">{conv.user?.name || "User"}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-purple-400 text-white text-xs rounded-full px-2 py-0.5">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-600 mb-2">No conversations yet</p>
                <p className="text-xs text-slate-500 mb-4">Find users to start chatting</p>
                <Button
                  onClick={() => setSearchDialogOpen(true)}
                  className="rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Users
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              <div className="sticky top-0 z-10 p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1" onClick={() => selectedUserId && navigate(`/profile/${selectedUserId}`)}>
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={conversations?.find(c => c.user?._id === selectedUserId)?.user?.image} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-200 to-blue-200">
                          {conversations?.find(c => c.user?._id === selectedUserId)?.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUserPresence?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {conversations?.find(c => c.user?._id === selectedUserId)?.user?.name || "User"}
                      </p>
                      {isOtherUserTyping ? (
                        <p className="text-xs text-purple-600">typing...</p>
                      ) : selectedUserPresence?.isOnline ? (
                        <p className="text-xs text-emerald-600">online</p>
                      ) : (
                        <p className="text-xs text-slate-500">offline</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => toast.info("Voice call feature coming soon")}
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                        title="Start voice call"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => toast.info("Video call feature coming soon")}
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                        title="Start video call"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 messages-scroll scroll-snap-type-y overflow-hidden">
                <div className="space-y-3">
                  {currentConversation?.slice().reverse().map((msg, idx) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`flex ${msg.senderId === user?._id ? "justify-end" : "justify-start"} scroll-snap-align-start`}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex flex-col gap-1.5 max-w-xs">
                        <div
                          className={`px-4 py-2.5 rounded-3xl shadow-md hover:shadow-lg transition-shadow ${
                            msg.senderId === user?._id
                              ? "bg-gradient-to-br from-rose-200 to-pink-300 text-slate-900 rounded-br-sm"
                              : "bg-gradient-to-br from-amber-100 to-yellow-200 text-slate-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                        </div>
                        {msg.senderId === user?._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-end gap-1 px-2"
                          >
                            <span className={`text-xs font-medium ${
                              msg.read ? "text-blue-500" : "text-slate-400"
                            }`}>
                              {msg.read ? "✓✓ Read" : "✓ Sent"}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isOtherUserTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
                        <div className="flex gap-1">
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="sticky bottom-0 z-10 p-4 border-t border-slate-200 bg-white/50 backdrop-blur-sm flex-shrink-0 overflow-hidden">
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 shadow-sm border border-purple-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                        />
                        <span className="text-sm font-semibold text-slate-900">Uploading file...</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <Progress value={uploadProgress} className="h-2.5 rounded-full flex-1 bg-white/50" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelUpload}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-red-100 hover:shadow-sm active:scale-95 transition-all duration-150"
                      >
                        <X className="h-4 w-4 text-red-500" strokeWidth={2.5} />
                      </Button>
                    </div>
                  </motion.div>
                )}
                <div className="flex gap-2">
                  <motion.div className="flex-1">
                    <Input
                      value={message}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder="Type a message..."
                      disabled={isUploading}
                      className="rounded-xl border-2 border-cyan-200 bg-white/80 transition-all duration-200 focus:border-cyan-400 focus:bg-white focus:shadow-md focus:ring-0 focus:outline-none hover:border-cyan-300 hover:bg-white/90 disabled:opacity-50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !isUploading) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSend}
                      disabled={!message.trim() || isUploading}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 active:scale-95 transition-all duration-150 disabled:opacity-70 text-white font-semibold shadow-md hover:shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-6">
              <MessageCircle className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-lg font-semibold mb-2">Select a conversation</p>
              <p className="text-sm text-slate-500 mb-4">Choose a conversation from the list or find new users</p>
                    <Button
                      onClick={() => setSearchDialogOpen(true)}
                      className="rounded-xl bg-gradient-to-r from-violet-300 to-purple-300 hover:from-violet-400 hover:to-purple-400 text-slate-900 font-semibold"
                    >
                <Search className="h-4 w-4 mr-2" />
                Find Users
              </Button>
            </div>
          )}
        </div>
      </div>

      <UserSearch open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
    </div>
  );
}