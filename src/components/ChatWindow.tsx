import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Send, X, Phone, Video } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface ChatWindowProps {
  selectedUserId: string | null;
  selectedUserName: string;
  selectedUserImage: string | undefined;
  isOnline: boolean;
  isTyping: boolean;
  messages: any[];
  currentUserId: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  onCancelUpload: () => void;
  onStartCall?: (type: "voice" | "video") => void;
}

export function ChatWindow({
  selectedUserId,
  selectedUserName,
  selectedUserImage,
  isOnline,
  isTyping,
  messages,
  currentUserId,
  onSendMessage,
  onFileUpload,
  isUploading,
  uploadProgress,
  onCancelUpload,
  onStartCall,
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUserId) return;
    try {
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (!selectedUserId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-6">
        <p className="text-lg font-semibold mb-2">Select a conversation</p>
        <p className="text-sm text-slate-500">Choose a conversation from the list</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={selectedUserImage} />
                <AvatarFallback className="bg-gradient-to-br from-purple-200 to-blue-200">
                  {selectedUserName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{selectedUserName}</p>
              {isTyping ? (
                <p className="text-xs text-purple-600">typing...</p>
              ) : isOnline ? (
                <p className="text-xs text-emerald-600">online</p>
              ) : (
                <p className="text-xs text-slate-500">offline</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onStartCall?.("voice")}
                size="sm"
                className="rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onStartCall?.("video")}
                size="sm"
                className="rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
              >
                <Video className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 messages-scroll scroll-snap-type-y overflow-hidden">
        <div className="space-y-3">
          {messages?.slice().reverse().map((msg, idx) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"} scroll-snap-align-start`}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex flex-col gap-1.5 max-w-xs">
                <div
                  className={`px-4 py-2.5 rounded-3xl shadow-md hover:shadow-lg transition-shadow ${
                    msg.senderId === currentUserId
                      ? "bg-gradient-to-br from-rose-200 to-pink-300 text-slate-900 rounded-br-sm"
                      : "bg-gradient-to-br from-amber-100 to-yellow-200 text-slate-900 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                </div>
                {msg.senderId === currentUserId && (
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

          {isTyping && (
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

      {/* Input Area */}
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
                onClick={onCancelUpload}
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
              onChange={(e) => setMessage(e.target.value)}
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
    </div>
  );
}