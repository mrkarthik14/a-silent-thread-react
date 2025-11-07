import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Send, Loader2, Share2, Users } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("following");

  const searchUsers = useQuery(api.search.searchUsers, {
    query: searchQuery,
  });

  const followingList = useQuery(api.follows.getFollowing, {});

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

  const handleSocialShare = (platform: string) => {
    const text = `Check out this post on A Silent Thread!`;
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank");
      toast.success(`Opening ${platform}`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="following" className="rounded-lg gap-2">
              <Users className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="social" className="rounded-lg gap-2">
              <Share2 className="h-4 w-4" />
              Social Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" strokeWidth={1.5} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search following..."
                className="pl-10 rounded-xl"
              />
            </div>

            <ScrollArea className="h-48 border border-slate-200 rounded-xl p-2">
              <div className="space-y-2">
                {followingList && followingList.length > 0 ? (
                  followingList
                    .filter((user: any) =>
                      !searchQuery ||
                      user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user: any) => (
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
                  <p className="text-center text-slate-500 py-8">No following users</p>
                )}
              </div>
            </ScrollArea>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = followingList?.find((u: any) => u._id === userId);
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
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare("whatsapp")}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-100 hover:bg-green-200 transition-colors"
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <span className="font-semibold text-green-900">WhatsApp</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare("facebook")}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span className="font-semibold text-blue-900">Facebook</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare("twitter")}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-black/10 hover:bg-black/20 transition-colors"
              >
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">𝕏</span>
                </div>
                <span className="font-semibold text-slate-900">X</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare("linkedin")}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-700/10 hover:bg-blue-700/20 transition-colors"
              >
                <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <span className="font-semibold text-blue-900">LinkedIn</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare("telegram")}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✈</span>
                </div>
                <span className="font-semibold text-blue-900">Telegram</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🔗</span>
                </div>
                <span className="font-semibold text-slate-900">Copy Link</span>
              </motion.button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}