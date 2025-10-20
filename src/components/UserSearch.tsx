import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Id } from "@/convex/_generated/dataModel";
import { LoadingLogo } from "@/components/LoadingLogo";

interface UserSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSearch({ open, onOpenChange }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [followingId, setFollowingId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const searchResults = useQuery(api.search.searchUsers, { query: searchQuery });
  const followUser = useMutation(api.follows.follow);
  
  // Get presence for all search results
  const userIds = searchResults?.map(u => u._id) || [];
  const presenceMap = useQuery(
    api.presence.getBulkPresence,
    userIds.length > 0 ? { userIds } : "skip"
  );

  const handleFollow = async (userId: Id<"users">) => {
    setFollowingId(userId);
    try {
      const result = await followUser({ userId });
      toast.success(result.following ? "Followed user" : "Unfollowed user");
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setFollowingId(null);
    }
  };

  const handleMessage = (userId: Id<"users">) => {
    setMessagingId(userId);
    setTimeout(() => {
      navigate("/messages");
      setMessagingId(null);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-900" strokeWidth={1.5} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            {searchResults?.map((user, index) => {
              const isOnline = presenceMap?.[user._id] || false;
              const isFollowing = followingId === user._id;
              const isMessaging = messagingId === user._id;
              
              return (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                          {user.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{user.name || "Anonymous"}</p>
                      <p className="text-xs text-slate-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFollow(user._id)}
                      disabled={isFollowing}
                      className="rounded-xl hover:bg-purple-50 active:scale-95 transition-all duration-150 disabled:opacity-70"
                    >
                      {isFollowing ? (
                        <LoadingLogo size="sm" variant="handshake" />
                      ) : (
                        <UserPlus className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMessage(user._id)}
                      disabled={isMessaging}
                      className="rounded-xl hover:bg-blue-50 active:scale-95 transition-all duration-150 disabled:opacity-70"
                    >
                      {isMessaging ? (
                        <LoadingLogo size="sm" variant="handshake" />
                      ) : (
                        <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}

            {searchQuery && searchResults?.length === 0 && (
              <p className="text-center text-slate-600 py-8">No users found</p>
            )}

            {!searchQuery && (
              <p className="text-center text-slate-600 py-8">Start typing to search for users</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}