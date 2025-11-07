import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface FollowingShareListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (userIds: Id<"users">[]) => Promise<void>;
  title?: string;
}

export function FollowingShareList({
  open,
  onOpenChange,
  onShare,
  title = "Share with Following",
}: FollowingShareListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  const followingList = useQuery(api.follows.getFollowing, {});

  const filteredUsers = followingList?.filter((user: any) =>
    user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
      await onShare(selectedUsers);
      toast.success(`Shared with ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`);
      setSelectedUsers([]);
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to share");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" strokeWidth={1.5} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search following..."
              className="pl-10 rounded-xl"
            />
          </div>

          <ScrollArea className="h-64 border border-slate-200 rounded-xl p-2">
            <div className="space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: any) => (
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
                        <Check className="h-3 w-3 text-white" strokeWidth={2} />
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No following users found</p>
              )}
            </div>
          </ScrollArea>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((userId) => {
                const user = filteredUsers.find((u: any) => u._id === userId);
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
