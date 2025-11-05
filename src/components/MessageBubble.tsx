import { motion } from "framer-motion";
import { Heart, Trash2, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageBubbleProps {
  msg: any;
  currentUserId: string | null;
  senderImage?: string;
  senderName?: string;
  onReply: (message: any) => void;
  onDelete: (messageId: any) => Promise<any>;
  onAddReaction: (messageId: any, emoji: string) => Promise<any>;
  onRemoveReaction: (messageId: any, emoji: string) => Promise<any>;
  onLike: (messageId: any) => Promise<any>;
  onUnlike: (messageId: any) => Promise<any>;
}

export function MessageBubble({
  msg,
  currentUserId,
  senderImage,
  senderName,
  onReply,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  onLike,
  onUnlike,
}: MessageBubbleProps) {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"} scroll-snap-align-start gap-2`}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {msg.senderId !== currentUserId && (
        <Avatar className="h-8 w-8 border-2 border-white shadow-sm flex-shrink-0 mt-1">
          <AvatarImage src={senderImage} alt={senderName} />
          <AvatarFallback className="bg-gradient-to-br from-cyan-200 to-blue-200 text-xs">
            {senderName?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col gap-1.5 max-w-xs">
        {/* Parent message reference for replies */}
        {msg.parentMessage && (
          <div className="px-3 py-2 bg-white/40 rounded-lg border-l-4 border-purple-300 text-xs text-slate-700 mb-1">
            <p className="font-semibold text-slate-600">Replying to:</p>
            <p className="text-slate-600 truncate">{msg.parentMessage.content}</p>
          </div>
        )}

        <div
          className={`px-4 py-2.5 rounded-3xl shadow-md hover:shadow-lg transition-shadow relative group ${
            msg.senderId === currentUserId
              ? "bg-gradient-to-br from-rose-200 to-pink-300 text-slate-900 rounded-br-sm"
              : "bg-gradient-to-br from-amber-100 to-yellow-200 text-slate-900 rounded-bl-sm"
          }`}
          onMouseEnter={() => setHoveredMessageId(msg._id as any)}
          onMouseLeave={() => setHoveredMessageId(null)}
        >
          {/* Display shared post */}
          {msg.messageType === "sharedPost" && (
            <div className="bg-white/40 rounded-lg p-3 mb-2 border border-white/50">
              <p className="text-xs font-semibold text-slate-700 mb-2">Shared Post</p>
              <p className="text-sm text-slate-800 mb-2">{msg.content}</p>
            </div>
          )}

          {/* Display uploaded image */}
          {msg.mediaUrl && msg.messageType === "image" && (
            <img
              src={msg.mediaUrl}
              alt="Uploaded"
              className="rounded-lg mb-2 max-w-xs w-full object-cover max-h-64"
            />
          )}

          {/* Display other file types */}
          {msg.mediaUrl && msg.messageType === "file" && (
            <div className="bg-white/30 rounded-lg p-2 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              <a
                href={msg.mediaUrl}
                download={msg.fileName}
                className="text-xs text-blue-600 hover:underline truncate"
              >
                {msg.fileName || "Download file"}
              </a>
            </div>
          )}

          <p className="text-sm leading-relaxed break-words">{msg.content}</p>

          {/* Reaction Picker on Hover */}
          {hoveredMessageId === msg._id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute -top-12 left-0 bg-white rounded-2xl shadow-lg border border-slate-200 p-2 flex gap-1 z-20"
            >
              {["😂", "❤️", "😮", "😢", "🔥", "👍"].map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.3, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => {
                    await onAddReaction(msg._id, emoji);
                    toast.success(`Added ${emoji} reaction`);
                  }}
                  className="text-lg hover:bg-purple-100 rounded-lg p-1.5 transition-colors cursor-pointer"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Message Actions on Hover */}
          {hoveredMessageId === msg._id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-10 right-0 flex gap-1 bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-20"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReply(msg)}
                className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                title="Reply to message"
              >
                <span className="text-sm">↩️</span>
              </motion.button>
              {msg.senderId === currentUserId && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => await onDelete(msg._id)}
                  className="p-1.5 hover:bg-red-100 rounded transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* Reactions Display */}
        {msg.reactions && msg.reactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex gap-1.5 flex-wrap px-2"
          >
            {msg.reactions.map((reaction: any, idx: number) => (
              <motion.button
                key={reaction.emoji}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (reaction.userIds.includes(currentUserId!)) {
                    await onRemoveReaction(msg._id, reaction.emoji);
                  } else {
                    await onAddReaction(msg._id, reaction.emoji);
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  reaction.userIds.includes(currentUserId!)
                    ? "bg-gradient-to-r from-purple-200 to-pink-200 text-slate-900"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                <motion.span
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2 }}
                >
                  {reaction.emoji}
                </motion.span>
                <span>{reaction.userIds.length}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {msg.senderId === currentUserId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-end gap-1 px-2"
          >
            <span
              className={`text-xs font-medium ${
                msg.read ? "text-blue-500" : "text-slate-400"
              }`}
            >
              {msg.read ? "✓✓ Read" : "✓ Sent"}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
