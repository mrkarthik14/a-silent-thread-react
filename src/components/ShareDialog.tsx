import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: Id<"posts">;
}

export function ShareDialog({ open, onOpenChange, postId }: ShareDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [message, setMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const searchUsers = useQuery(api.search.searchUsers, {
    query: searchQuery,
  });

  const sharePost = useMutation(api.share.sharePost);

  const handleSelectUser = (userId: Id<"users">) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsSharing(true);
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          sharePost({
            postId,
            recipientId: userId,
            message: message || undefined,
          })
        )
      );
      toast.success(`Post shared with ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`);
      setSelectedUsers([]);
      setMessage("");
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to share post");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" strokeWidth={1.5} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-10 rounded-xl"
            />
          </div>

          {searchQuery.trim().length > 0 && searchUsers && (
            <ScrollArea className="h-48 border border-slate-200 rounded-xl p-2">
              <div className="space-y-2">
                {searchUsers.length > 0 ? (
                  searchUsers.map((user: any) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleSelectUser(user._id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user._id)
                          ? "bg-purple-100 border border-purple-300"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                          {user.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-600 truncate">{user.email}</p>
                      </div>
                      {selectedUsers.includes(user._id) && (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-8">No users found</p>
                )}
              </div>
            </ScrollArea>
          )}

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((userId) => {
                const user = searchUsers?.find((u: any) => u._id === userId);
                return (
                  <motion.div
                    key={userId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {user?.name || "User"}
                    <button
                      onClick={() => handleSelectUser(userId)}
                      className="hover:text-purple-700"
                    >
                      ×
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-900 mb-2 block">Message (optional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleShare}
              disabled={isSharing || selectedUsers.length === 0}
              className="flex-1 rounded-xl gap-2"
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}