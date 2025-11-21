import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { motion } from "framer-motion";
import { Loader2, Send, Search, UserPlus, MessageCircle, Paperclip, Smile, X, ImageIcon, Video, FileText, Heart, Trash2, Eye, Phone, Mic } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router";
import { UserSearch } from "@/components/UserSearch";
import { MessageBubble } from "@/components/MessageBubble";

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
  const [replyMessage, setReplyMessage] = useState<any>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  
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
  
  // Get selected user data
  const selectedUserConv = conversations?.find(c => c.user?._id === selectedUserId);
  
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
  const pinMessage = useMutation(api.messages.pinMessage);
  const unpinMessage = useMutation(api.messages.unpinMessage);

  const initiateCall = useMutation(api.calls.initiateCall);
  const acceptCall = useMutation(api.calls.acceptCall);
  const rejectCall = useMutation(api.calls.rejectCall);
  const endCall = useMutation(api.calls.endCall);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    try {
      await acceptCall({ callId: incomingCall._id });
      setActiveCall(incomingCall);
      setIncomingCall(null);
      toast.success("Call accepted");
    } catch (error) {
      toast.error("Failed to accept call");
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;
    try {
      await rejectCall({ callId: incomingCall._id });
      setIncomingCall(null);
      toast.info("Call rejected");
    } catch (error) {
      toast.error("Failed to reject call");
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    try {
      await endCall({ callId: activeCall._id });
      setActiveCall(null);
      setIsRecordingVoice(false);
      setRecordingTime(0);
      toast.success("Call ended");
    } catch (error) {
      toast.error("Failed to end call");
    }
  };

  // Handle recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

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
        parentMessageId: replyMessage?._id,
      });
      setMessage("");
      setReplyMessage(null);
      
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

    // Show preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setPreviewFile(file);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For non-image files, upload directly
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!selectedUserId) return;

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
          try {
            const { storageId } = JSON.parse(xhr.responseText);
            await sendMessage({
              recipientId: selectedUserId,
              content: `Shared a file: ${file.name}`,
              messageType: file.type.startsWith("image/") ? "image" : "file",
              mediaUrl: storageId,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            });
            toast.success("File uploaded successfully");
            setIsUploading(false);
            setUploadProgress(0);
            setImagePreview(null);
            setPreviewFile(null);
          } catch (parseError) {
            toast.error("Failed to process upload response");
            setIsUploading(false);
            setUploadProgress(0);
          }
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-300/30 dark:bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-300/30 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[50%] h-[50%] rounded-full bg-pink-300/30 dark:bg-pink-900/20 blur-[120px]" />
      </div>

      {/* Glass Overlay & Content */}
      <div className="relative z-10 flex w-full h-full bg-white/40 dark:bg-slate-950/40 backdrop-blur-3xl saturate-150 transition-colors duration-300">
        <Sidebar />
      
        <div className="flex-1 flex ml-0 md:ml-20">
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transition-colors duration-500">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors duration-500">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Messages</h2>
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
                        <AvatarImage src={conv.user?.image} alt={conv.user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-200 to-blue-200">
                          {conv.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">{conv.user?.name || "User"}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-purple-400 text-white text-xs rounded-full px-2 py-0.5">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-600 dark:text-slate-300 mb-2">No conversations yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Find users to start chatting</p>
              <Button
                onClick={() => setSearchDialogOpen(true)}
                className="rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
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
              <div className="sticky top-0 z-10 p-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transition-colors duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1" onClick={() => selectedUserId && navigate(`/profile/${selectedUserId}`)}>
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={selectedUserConv?.user?.image} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-200 to-blue-200 dark:from-cyan-700 dark:to-blue-700">
                          {selectedUserConv?.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUserPresence?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {conversations?.find(c => c.user?._id === selectedUserId)?.user?.name || "User"}
                      </p>
                      {isOtherUserTyping ? (
                        <p className="text-xs text-purple-600 dark:text-purple-400">typing...</p>
                      ) : selectedUserPresence?.isOnline ? (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">online</p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">offline</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} whileInView={{ opacity: 1 }}>
                      <Button
                        onClick={() => {
                          toast.success("Initiating voice call...");
                          initiateCall({ recipientId: selectedUserId!, callType: "voice" });
                        }}
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-blue-300 to-cyan-400 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 flex items-center gap-1.5"
                        title="Start voice call"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-xs">Call</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} whileInView={{ opacity: 1 }}>
                      <Button
                        onClick={() => {
                          toast.success("Initiating video call...");
                          initiateCall({ recipientId: selectedUserId!, callType: "video" });
                        }}
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 flex items-center gap-1.5"
                        title="Start video call"
                      >
                        <Video className="h-4 w-4" />
                        <span className="text-xs">Video</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 messages-scroll scroll-snap-type-y overflow-hidden">
                <div className="space-y-3">
                  {currentConversation?.slice().reverse().map((msg, idx) => {
                    const isCurrentUserMessage = msg.senderId === user?._id;
                    const senderImage = isCurrentUserMessage ? user?.image : selectedUserConv?.user?.image;
                    const senderName = isCurrentUserMessage ? user?.name : selectedUserConv?.user?.name;
                    
                    return (
                    <MessageBubble
                      key={msg._id}
                      msg={msg}
                      currentUserId={user?._id || null}
                      senderImage={senderImage}
                      senderName={senderName}
                      onReply={(message) => setReplyMessage(message)}
                      onDelete={(messageId) => deleteMessage({ messageId })}
                      onAddReaction={(messageId, emoji) => addReaction({ messageId, emoji })}
                      onRemoveReaction={(messageId, emoji) => removeReaction({ messageId, emoji })}
                      onLike={(messageId) => likeMessage({ messageId })}
                      onUnlike={(messageId) => unlikeMessage({ messageId })}
                    />
                    );
                  })}
                  
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
                {replyMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-3 shadow-sm border border-blue-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Replying to message</p>
                        <p className="text-sm text-slate-700 truncate">{replyMessage.content}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyMessage(null)}
                        className="h-6 w-6 p-0 rounded-lg hover:bg-red-100"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                )}
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 shadow-sm border border-blue-100"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-2">{previewFile?.name}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => uploadFile(previewFile!)}
                            className="rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white font-semibold active:scale-95 transition-all duration-150"
                          >
                            Upload
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setImagePreview(null);
                              setPreviewFile(null);
                            }}
                            className="rounded-lg active:scale-95 transition-all duration-150"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                      accept="*/*"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Button
                        type="button"
                        size="sm"
                        asChild
                        className="rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                        title="Upload file"
                      >
                        <span>
                          <Paperclip className="h-4 w-4" />
                        </span>
                      </Button>
                    </label>
                  </motion.div>
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
                      onClick={() => toast.info("Voice message feature coming soon")}
                      disabled={isUploading}
                      className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-70"
                      title="Record voice message"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
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
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 p-6">
              <MessageCircle className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-lg font-semibold mb-2 dark:text-white">Select a conversation</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose a conversation from the list or find new users</p>
                  <Button
                    onClick={() => setSearchDialogOpen(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-300 to-cyan-300 hover:from-blue-400 hover:to-cyan-400 text-slate-900 font-semibold"
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
    </div>
  );
}