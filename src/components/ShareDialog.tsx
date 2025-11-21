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
import { motion, AnimatePresence } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl mb-4">
            <TabsTrigger value="following" className="rounded-lg gap-2 transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="social" className="rounded-lg gap-2 transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Share2 className="h-4 w-4" />
              Social Media
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "following" ? (
              <TabsContent value="following" className="space-y-4 mt-0" asChild>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search following..."
                      className="pl-10 rounded-xl transition-all focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <ScrollArea className="h-64 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    <motion.div 
                      className="space-y-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
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
                              variants={itemVariants}
                              onClick={() => handleSelectUser(user._id)}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                selectedUsers.includes(user._id)
                                  ? "bg-purple-100 border border-purple-300 shadow-sm"
                                  : "hover:bg-white hover:shadow-sm border border-transparent"
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={user.image} />
                                <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-white">
                                  {user.name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                              </div>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                selectedUsers.includes(user._id) 
                                  ? "bg-purple-500 scale-100" 
                                  : "bg-slate-200 scale-90 opacity-50"
                              }`}>
                                {selectedUsers.includes(user._id) && (
                                  <motion.span 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    className="text-white text-xs font-bold"
                                  >
                                    ✓
                                  </motion.span>
                                )}
                              </div>
                            </motion.div>
                          ))
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-12 text-slate-400"
                        >
                          <Users className="h-12 w-12 mb-2 opacity-20" />
                          <p>No following users found</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </ScrollArea>

                  <AnimatePresence>
                    {selectedUsers.length > 0 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-2 py-2">
                          {selectedUsers.map((userId) => {
                            const user = followingList?.find((u: any) => u._id === userId);
                            return (
                              <motion.div
                                key={userId}
                                layout
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="bg-purple-100 text-purple-900 pl-3 pr-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-purple-200 shadow-sm"
                              >
                                {user?.name || "User"}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectUser(userId);
                                  }}
                                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                                >
                                  <span className="sr-only">Remove</span>
                                  ×
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Message (optional)</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal note..."
                      className="rounded-xl resize-none focus:ring-2 focus:ring-purple-200 transition-all"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleShare}
                      disabled={isSharing || selectedUsers.length === 0}
                      className="flex-1 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSharing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Share Post
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => onOpenChange(false)}
                      variant="outline"
                      className="flex-1 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            ) : (
              <TabsContent value="social" className="space-y-4 mt-0" asChild>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="grid grid-cols-2 gap-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSocialShare("whatsapp")}
                      className="flex items-center justify-start gap-3 p-4 rounded-2xl bg-green-50 hover:bg-green-100 border border-green-100 hover:border-green-200 transition-all group"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                        <span className="text-white text-lg font-bold">W</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-green-900">WhatsApp</span>
                        <span className="text-xs text-green-700/70">Share to contacts</span>
                      </div>
                    </motion.button>

                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSocialShare("facebook")}
                      className="flex items-center justify-start gap-3 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                        <span className="text-white text-lg font-bold">f</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-blue-900">Facebook</span>
                        <span className="text-xs text-blue-700/70">Share to feed</span>
                      </div>
                    </motion.button>

                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSocialShare("twitter")}
                      className="flex items-center justify-start gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
                    >
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                        <span className="text-white text-lg font-bold">𝕏</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900">X</span>
                        <span className="text-xs text-slate-600">Share to followers</span>
                      </div>
                    </motion.button>

                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSocialShare("linkedin")}
                      className="flex items-center justify-start gap-3 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                        <span className="text-white text-sm font-bold">in</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-blue-900">LinkedIn</span>
                        <span className="text-xs text-blue-700/70">Share with network</span>
                      </div>
                    </motion.button>

                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSocialShare("telegram")}
                      className="flex items-center justify-start gap-3 p-4 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-200 transition-all group"
                    >
                      <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                        <span className="text-white text-lg font-bold">✈</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-sky-900">Telegram</span>
                        <span className="text-xs text-sky-700/70">Send message</span>
                      </div>
                    </motion.button>

                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCopyLink}
                      className="flex items-center justify-start gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all group"
                    >
                      <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                        <span className="text-white text-lg font-bold">🔗</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900">Copy Link</span>
                        <span className="text-xs text-slate-600">Copy to clipboard</span>
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}