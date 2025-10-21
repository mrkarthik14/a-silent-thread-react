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
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Search, MessageCircle, Paperclip, Smile, X, ImageIcon, Video, FileText, Heart, Trash2, Eye, Reply, MoreVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router";
import { UserSearch } from "@/components/UserSearch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleSend = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || !selectedUserId) return;

    try {
      setIsUploading(true);
      
      // Clear typing indicator
      await clearTyping({ recipientId: selectedUserId });
      
      let mediaUrl: string | undefined;
      let messageType: "text" | "image" | "video" | "file" = "text";
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let fileType: string | undefined;

      // Upload files if selected
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        
        // Validate file size
        const maxSize = file.type.startsWith("image/") ? 10 * 1024 * 1024 : 
                       file.type.startsWith("video/") ? 50 * 1024 * 1024 : 
                       25 * 1024 * 1024;
        
        if (file.size > maxSize) {
          toast.error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
          setIsUploading(false);
          return;
        }

        const uploadUrl = await generateUploadUrl();
        
        abortControllerRef.current = new AbortController();
        
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress((e.loaded / e.total) * 100);
          }
        });

        await new Promise((resolve, reject) => {
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        const { storageId } = JSON.parse(xhr.response);
        mediaUrl = storageId;
        fileName = file.name;
        fileSize = file.size;
        fileType = file.type;
        
        if (file.type.startsWith("image/")) messageType = "image";
        else if (file.type.startsWith("video/")) messageType = "video";
        else messageType = "file";
      }
      
      await sendMessage({
        recipientId: selectedUserId,
        content: message || `Sent a ${messageType}`,
        messageType,
        mediaUrl,
        fileName,
        fileSize,
        fileType,
        parentMessageId: replyingTo?._id,
      });
      
      setMessage("");
      setSelectedFiles([]);
      setReplyingTo(null);
      setUploadProgress(0);
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFiles([]);
      toast.info("Upload cancelled");
    }
  };

  const handleDeleteMessage = async (messageId: Id<"messages">) => {
    try {
      await deleteMessage({ messageId });
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleHideMessage = async (messageId: Id<"messages">) => {
    try {
      await hideMessage({ messageId });
      toast.success("Message hidden");
    } catch (error) {
      toast.error("Failed to hide message");
    }
  };

  const handleLikeMessage = async (messageId: Id<"messages">, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeMessage({ messageId });
      } else {
        await likeMessage({ messageId });
      }
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleReaction = async (messageId: Id<"messages">, emoji: string) => {
    try {
      await addReaction({ messageId, emoji });
      setShowReactionPicker(null);
      toast.success("Reaction added");
    } catch (error) {
      toast.error("Failed to add reaction");
    }
  };

  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

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
          
          <ScrollArea className="h-[calc(100vh-73px)] conversations-scroll">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <motion.div
                  key={conv.user?._id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedUserId(conv.user?._id || null)}
                  className={`p-4 cursor-pointer border-b border-slate-200 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-colors ${
                    selectedUserId === conv.user?._id ? "from-purple-100 to-pink-100" : ""
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
                  className="rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500"
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
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-rose-50 to-pink-50 backdrop-blur-sm">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => selectedUserId && navigate(`/profile/${selectedUserId}`)}>
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
              </div>

              <ScrollArea className="flex-1 p-4 messages-scroll">
                <div className="space-y-3">
                  {currentConversation?.filter(msg => !msg.isDeleted && !msg.isHidden).slice().reverse().map((msg, idx) => {
                    const isLiked = msg.likes?.includes(user?._id as Id<"users">);
                    const isSender = msg.senderId === user?._id;
                    
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                        onMouseEnter={() => setHoveredMessageId(msg._id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        <div className="flex flex-col gap-1.5 max-w-xs relative group">
                          {/* Message Actions */}
                          <AnimatePresence>
                            {hoveredMessageId === msg._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`absolute -top-8 ${isSender ? "right-0" : "left-0"} flex gap-1 bg-white rounded-lg shadow-lg p-1 z-10`}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setReplyingTo(msg)}
                                >
                                  <Reply className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleLikeMessage(msg._id, isLiked || false)}
                                >
                                  <Heart className={`h-3 w-3 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                                </Button>
                                <Popover open={showReactionPicker === msg._id} onOpenChange={(open) => setShowReactionPicker(open ? msg._id : null)}>
                                  <PopoverTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                      <Smile className="h-3 w-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-2">
                                    <div className="flex gap-1">
                                      {commonEmojis.map((emoji) => (
                                        <Button
                                          key={emoji}
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-lg"
                                          onClick={() => handleReaction(msg._id, emoji)}
                                        >
                                          {emoji}
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    {isSender && (
                                      <DropdownMenuItem onClick={() => handleDeleteMessage(msg._id)}>
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    )}
                                    {!isSender && (
                                      <DropdownMenuItem onClick={() => handleHideMessage(msg._id)}>
                                        <Eye className="h-3 w-3 mr-2" />
                                        Hide
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Reply indicator */}
                          {msg.parentMessageId && (
                            <div className="text-xs text-slate-500 italic px-2">
                              Replying to a message
                            </div>
                          )}

                          <div
                            className={`px-4 py-2.5 rounded-3xl shadow-md hover:shadow-lg transition-shadow ${
                              isSender
                                ? "bg-gradient-to-br from-rose-100 to-pink-200 text-slate-800 rounded-br-sm"
                                : "bg-gradient-to-br from-amber-50 to-yellow-100 text-slate-800 rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                          </div>

                          {/* Reactions */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex gap-1 flex-wrap px-2">
                              {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                <span key={emoji} className="text-xs bg-white rounded-full px-2 py-0.5 shadow-sm">
                                  {emoji} {userIds.length}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Likes count */}
                          {msg.likes && msg.likes.length > 0 && (
                            <div className="text-xs text-slate-500 px-2">
                              <Heart className="h-3 w-3 inline fill-red-500 text-red-500" /> {msg.likes.length}
                            </div>
                          )}

                          {isSender && (
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

              <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-cyan-50 to-emerald-50 backdrop-blur-sm sticky bottom-0">
                {/* Reply Preview */}
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 bg-white rounded-xl p-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Reply className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">Replying to: {replyingTo.content.substring(0, 30)}...</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {/* File Preview */}
                {selectedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 bg-white rounded-xl p-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{selectedFiles[0].name}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedFiles([])}>
                      <X className="h-4 w-4" />
                    </Button>
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-xl hover:bg-cyan-100"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
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
                      disabled={(!message.trim() && selectedFiles.length === 0) || isUploading}
                      className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all duration-150 disabled:opacity-70 text-white font-semibold shadow-md hover:shadow-lg"
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