import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { motion } from "framer-motion";
import { Loader2, Send, Search, UserPlus, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router";
import { UserSearch } from "@/components/UserSearch";

export default function Messages() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    (location.state as any)?.selectedUserId || null
  );
  const [message, setMessage] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typingIndicators.setTyping);
  const clearTyping = useMutation(api.typingIndicators.clearTyping);

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
          
          <ScrollArea className="h-[calc(100vh-73px)]">
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
              <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
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

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentConversation?.slice().reverse().map((msg) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderId === user?._id ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex flex-col gap-1">
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
                            msg.senderId === user?._id
                              ? "bg-gradient-to-br from-purple-400 to-blue-400 text-white"
                              : "bg-white border border-slate-200 text-slate-900"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        {msg.senderId === user?._id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 px-4"
                          >
                            <span className="text-xs text-slate-500">
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
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-200 bg-white/50 backdrop-blur-sm sticky bottom-0">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type a message..."
                    className="rounded-xl border-slate-200 focus:ring-2 focus:ring-purple-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className="rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all duration-150 disabled:opacity-70"
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
                className="rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500"
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