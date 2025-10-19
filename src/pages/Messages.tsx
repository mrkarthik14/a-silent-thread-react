import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function Messages() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [message, setMessage] = useState("");
  
  const conversations = useQuery(api.messages.getConversations, {});
  const currentConversation = useQuery(
    api.messages.getConversation,
    selectedUserId ? { userId: selectedUserId } : "skip"
  );
  const sendMessage = useMutation(api.messages.send);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleSend = async () => {
    if (!message.trim() || !selectedUserId) return;

    try {
      await sendMessage({
        recipientId: selectedUserId,
        content: message,
      });
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar />
      
      <div className="flex-1 flex">
        <div className="w-80 border-r border-pink-100 bg-white/50 backdrop-blur-sm">
          <div className="p-4 border-b border-pink-100">
            <h2 className="font-bold text-lg">Messages</h2>
          </div>
          
          <ScrollArea className="h-[calc(100vh-73px)]">
            {conversations?.map((conv) => (
              <motion.div
                key={conv.user?._id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedUserId(conv.user?._id || null)}
                className={`p-4 cursor-pointer border-b border-pink-50 hover:bg-pink-50/50 transition-colors ${
                  selectedUserId === conv.user?._id ? "bg-pink-100/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src={conv.user?.image} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-300 to-purple-300">
                      {conv.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{conv.user?.name || "User"}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-pink-400 text-white text-xs rounded-full px-2 py-0.5">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-pink-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage src={conversations?.find(c => c.user?._id === selectedUserId)?.user?.image} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-300 to-purple-300">
                      {conversations?.find(c => c.user?._id === selectedUserId)?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {conversations?.find(c => c.user?._id === selectedUserId)?.user?.name || "User"}
                    </p>
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
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          msg.senderId === user?._id
                            ? "bg-gradient-to-br from-pink-400 to-purple-400 text-white"
                            : "bg-white border border-pink-100"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-pink-100 bg-white/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="rounded-xl border-pink-100"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
