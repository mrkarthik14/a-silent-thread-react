import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Send, X, Phone, Video, Paperclip, Mic } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { MessageBubble } from "@/components/MessageBubble";
import { Id } from "@/convex/_generated/dataModel";
import { UserHoverCard } from "@/components/UserHoverCard";

interface ChatWindowProps {
  selectedUserId: string | null;
  selectedUserName: string;
  selectedUserImage: string | undefined;
  isOnline: boolean;
  isTyping: boolean;
  messages: any[];
  currentUserId: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  onCancelUpload: () => void;
  onStartCall?: (type: "voice" | "video") => void;
  
  // Additional props for full functionality
  replyMessage: any;
  onReply: (message: any) => void;
  onCancelReply: () => void;
  onDeleteMessage: (messageId: Id<"messages">) => Promise<void>;
  onAddReaction: (messageId: Id<"messages">, emoji: string) => Promise<void>;
  onRemoveReaction: (messageId: Id<"messages">, emoji: string) => Promise<void>;
  onLikeMessage: (messageId: Id<"messages">) => Promise<void>;
  onUnlikeMessage: (messageId: Id<"messages">) => Promise<void>;
  
  imagePreview: string | null;
  previewFile: File | null;
  onCancelPreview: () => void;
  onUploadPreview: () => void;
  
  onTyping: (value: string) => void;
  messageInput: string;
  setMessageInput: (value: string) => void;
  
  hideHeader?: boolean;
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
  
  replyMessage,
  onReply,
  onCancelReply,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
  onLikeMessage,
  onUnlikeMessage,
  
  imagePreview,
  previewFile,
  onCancelPreview,
  onUploadPreview,
  
  onTyping,
  messageInput,
  setMessageInput,
  
  hideHeader = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedUserId) return;
    try {
      await onSendMessage(messageInput);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (!selectedUserId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 p-6">
        <p className="text-lg font-semibold mb-2">Select a conversation</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">Choose a conversation from the list</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      {!hideHeader && (
        <div className="sticky top-0 z-10 p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm transition-colors duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1">
              <div className="relative">
                <UserHoverCard userId={selectedUserId as any}>
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src={selectedUserImage} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900">
                      {selectedUserName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </UserHoverCard>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <UserHoverCard userId={selectedUserId as any}>
                  <p className="font-semibold text-slate-900 dark:text-white hover:underline">{selectedUserName}</p>
                </UserHoverCard>
                {isTyping ? (
                  <p className="text-xs text-purple-600 dark:text-purple-400">typing...</p>
                ) : isOnline ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">online</p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">offline</p>
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
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 messages-scroll scroll-snap-type-y overflow-hidden">
        <div className="space-y-3">
          {messages?.slice().reverse().map((msg, idx) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              currentUserId={currentUserId}
              senderImage={msg.senderId === currentUserId ? undefined : selectedUserImage} // Simplified for now
              senderName={msg.senderId === currentUserId ? "You" : selectedUserName}
              onReply={onReply}
              onDelete={onDeleteMessage}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
              onLike={onLikeMessage}
              onUnlike={onUnlikeMessage}
            />
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex gap-1.5 items-center h-2">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 z-10 p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm flex-shrink-0 overflow-hidden">
        {replyMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-3 shadow-sm border border-blue-100 dark:border-blue-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Replying to message</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{replyMessage.content}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelReply}
                className="h-6 w-6 p-0 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
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
            className="mb-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 shadow-sm border border-blue-100 dark:border-blue-800"
          >
            <div className="flex items-start gap-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg border-2 border-white dark:border-slate-700 shadow-sm"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{previewFile?.name}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={onUploadPreview}
                    className="rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white font-semibold active:scale-95 transition-all duration-150"
                  >
                    Upload
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelPreview}
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
            className="mb-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-4 shadow-sm border border-purple-100 dark:border-purple-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Uploading file...</span>
              </div>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="flex gap-3 items-center">
              <Progress value={uploadProgress} className="h-2.5 rounded-full flex-1 bg-white/50 dark:bg-slate-700" />
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelUpload}
                className="h-8 w-8 p-0 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-sm active:scale-95 transition-all duration-150"
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
              onChange={onFileUpload}
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
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                onTyping(e.target.value);
              }}
              placeholder="Type a message..."
              disabled={isUploading}
              className="rounded-xl border-2 border-cyan-200 dark:border-cyan-800 bg-white/80 dark:bg-slate-800 transition-all duration-200 focus:border-cyan-400 dark:focus:border-cyan-600 focus:bg-white dark:focus:bg-slate-900 focus:shadow-md focus:ring-0 focus:outline-none hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-white/90 dark:hover:bg-slate-800/90 disabled:opacity-50"
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
              disabled={!messageInput.trim() || isUploading}
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