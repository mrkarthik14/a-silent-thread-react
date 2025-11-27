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
import { Loader2, Send, Search, UserPlus, MessageCircle, Paperclip, Smile, X, ImageIcon, Video, FileText, Heart, Trash2, Eye, Phone, Mic, PhoneOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router";
import { UserSearch } from "@/components/UserSearch";
import { MessageBubble } from "@/components/MessageBubble";
import { ActiveCall } from "@/components/ActiveCall";
import { IncomingCallDialog } from "@/components/IncomingCallDialog";
import { useAction } from "convex/react";
import { ThemeTransition } from "@/components/ThemeTransition";
import { ChatWindow } from "@/components/ChatWindow";

export default function Messages() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    (location.state as any)?.selectedUserId || null
  );

  // Update selectedUserId when location state changes (e.g. from UserSearch navigation)
  useEffect(() => {
    const stateUserId = (location.state as any)?.selectedUserId;
    if (stateUserId) {
      setSelectedUserId(stateUserId);
    }
  }, [location.state]);

  const [message, setMessage] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState<any>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [callTokenData, setCallTokenData] = useState<{ token: string; uid: number; appId: string } | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTypingRef = useRef<number>(0);
  
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
  
  // Get selected user data from conversations
  const selectedUserConv = conversations?.find(c => c.user?._id === selectedUserId);

  // Fetch user details directly if not found in conversations (for new chats)
  const userDetails = useQuery(
    api.users.getUser,
    selectedUserId ? { userId: selectedUserId } : "skip"
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
  const pinMessage = useMutation(api.messages.pinMessage);
  const unpinMessage = useMutation(api.messages.unpinMessage);

  const initiateCall = useMutation(api.calls.initiateCall);
  const acceptCall = useMutation(api.calls.acceptCall);
  const rejectCall = useMutation(api.calls.rejectCall);
  const endCall = useMutation(api.calls.endCall);

  const generateToken = useAction(api.agora.generateToken);

  const activeCall = useQuery(api.calls.getActiveCall, user ? { userId: user._id } : "skip");
  const incomingCallQuery = useQuery(api.calls.getIncomingCall);

  // Effect to generate token when call becomes active
  useEffect(() => {
    const fetchToken = async () => {
      if (activeCall && activeCall.status === "active" && !callTokenData) {
        try {
          const data = await generateToken({
            channelName: activeCall._id,
            role: "publisher",
          });
          setCallTokenData(data);
        } catch (error) {
          console.error("Failed to generate Agora token:", error);
          toast.error("Failed to join call");
        }
      } else if (!activeCall) {
        setCallTokenData(null);
      }
    };

    fetchToken();
  }, [activeCall, generateToken, callTokenData]);

  const handleStartCall = async (type: "voice" | "video") => {
    if (!selectedUserId) return;
    try {
      await initiateCall({
        recipientId: selectedUserId as Id<"users">,
        callType: type,
      });
      toast.success(`Starting ${type} call...`);
    } catch (error) {
      toast.error("Failed to start call");
    }
  };

  const handleEndCall = async () => {
    if (activeCall) {
      await endCall({ callId: activeCall._id });
      setCallTokenData(null);
    }
  };

  const handleAcceptCall = async () => {
    if (incomingCallQuery) {
      await acceptCall({ callId: incomingCallQuery._id });
    }
  };

  const handleRejectCall = async () => {
    if (incomingCallQuery) {
      await rejectCall({ callId: incomingCallQuery._id });
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
      const now = Date.now();
      // Throttle typing updates to once every 2 seconds to save DB writes
      if (now - lastTypingRef.current > 2000) {
        setTyping({ recipientId: selectedUserId, isTyping: true });
        lastTypingRef.current = now;
      }

      // Clear typing indicator after 3 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        clearTyping({ recipientId: selectedUserId });
        lastTypingRef.current = 0;
      }, 3000);
    } else {
      clearTyping({ recipientId: selectedUserId });
      lastTypingRef.current = 0;
    }
  };

  const handleSend = async (content?: string) => {
    const msgContent = content || message;
    if (!msgContent.trim() || !selectedUserId) return;

    try {
      // Clear typing indicator
      await clearTyping({ recipientId: selectedUserId });
      
      await sendMessage({
        recipientId: selectedUserId,
        content: msgContent,
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

  // Define the chat window component to be reused
  const chatWindowComponent = selectedUserId ? (
    <ChatWindow
      selectedUserId={selectedUserId}
      selectedUserName={selectedUserConv?.user?.name || userDetails?.name || "User"}
      selectedUserImage={selectedUserConv?.user?.image || userDetails?.image}
      isOnline={!!selectedUserPresence?.isOnline}
      isTyping={!!isOtherUserTyping}
      messages={currentConversation || []}
      currentUserId={user?._id || null}
      onSendMessage={async (content) => { await handleSend(content); }}
      onFileUpload={handleFileUpload}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      onCancelUpload={handleCancelUpload}
      onStartCall={handleStartCall}
      
      replyMessage={replyMessage}
      onReply={setReplyMessage}
      onCancelReply={() => setReplyMessage(null)}
      onDeleteMessage={async (id) => { await deleteMessage({ messageId: id }); }}
      onAddReaction={async (id, emoji) => { await addReaction({ messageId: id, emoji }); }}
      onRemoveReaction={async (id, emoji) => { await removeReaction({ messageId: id, emoji }); }}
      onLikeMessage={async (id) => { await likeMessage({ messageId: id }); }}
      onUnlikeMessage={async (id) => { await unlikeMessage({ messageId: id }); }}
      
      imagePreview={imagePreview}
      previewFile={previewFile}
      onCancelPreview={() => { setImagePreview(null); setPreviewFile(null); }}
      onUploadPreview={() => previewFile && uploadFile(previewFile)}
      
      onTyping={handleTyping}
      messageInput={message}
      setMessageInput={setMessage}
      
      hideHeader={!!activeCall}
    />
  ) : null;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
      {/* Active Call Overlay */}
      {activeCall && callTokenData && (
        <ActiveCall
          channelName={activeCall._id}
          appId={callTokenData.appId}
          token={callTokenData.token}
          uid={callTokenData.uid}
          callType={activeCall.callType as "voice" | "video"}
          onEndCall={handleEndCall}
          startTime={activeCall.startTime}
        >
          {chatWindowComponent}
        </ActiveCall>
      )}

      {/* Incoming Call Modal */}
      <IncomingCallDialog
        isOpen={!!incomingCallQuery}
        callType={incomingCallQuery?.callType}
        callerName="Incoming Caller" // Ideally fetch this
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      <ThemeTransition />
      <Sidebar />
      
      <div className="flex-1 flex">
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm transition-colors duration-500">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors duration-500">
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
                  className={`p-4 cursor-pointer border-b border-slate-200 dark:border-slate-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors ${
                    selectedUserId === conv.user?._id ? "bg-purple-100/50 dark:bg-purple-900/30" : ""
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
            chatWindowComponent
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
  );
}