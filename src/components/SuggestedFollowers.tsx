import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export function SuggestedFollowers() {
  const activeUsers = useQuery(api.users.getActiveUsers, {});
  const followUser = useMutation(api.follows.follow);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const handleFollow = async (userId: string) => {
    try {
      setFollowingIds(prev => new Set([...prev, userId]));
      const result = await followUser({ userId: userId as any });
      if (result.following) {
        toast.success("Following!");
      }
    } catch (error) {
      toast.error("Failed to follow user");
      setFollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (!activeUsers || activeUsers.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-2xl p-4 sticky top-24">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Users className="h-4 w-4" strokeWidth={1.5} />
        Online Now
      </h3>
      
      <div className="space-y-3">
        {activeUsers.map((user, index) => {
          const isFollowing = followingIds.has(user._id);

          return (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-xs">
                      {user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user.name || "Anonymous"}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFollow(user._id)}
                disabled={isFollowing}
                className="rounded-lg flex-shrink-0 ml-2 h-7 px-2 text-xs"
              >
                {isFollowing ? (
                  <Users className="h-3 w-3" strokeWidth={1.5} />
                ) : (
                  <UserPlus className="h-3 w-3" strokeWidth={1.5} />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
