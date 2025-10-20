import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CommentSection } from "@/components/CommentSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { toast } from "sonner";

interface PostCardProps {
  post: Doc<"posts"> & { user: Doc<"users"> | null };
  onReply?: () => void;
  onLike?: () => void;
  color?: string;
}

export function PostCard({ post, onReply, onLike, color = "bg-yellow-50" }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  // Check if current user has liked this post
  const userHasLiked = useQuery(api.posts.hasUserLiked, { postId: post._id });

  // Get presence status for post author
  const userPresence = useQuery(
    api.presence.getUserPresence,
    post.user?._id ? { userId: post.user._id } : "skip"
  );

  // Get user profile image URL
  const userImageUrl = useQuery(
    api.files.getImageUrl,
    post.user?.image ? { storageId: post.user.image } : "skip"
  );

  // Update local state when query result changes
  useEffect(() => {
    if (userHasLiked !== undefined) {
      setIsLiked(userHasLiked);
    }
  }, [userHasLiked]);

  // Get URLs for images
  const imageUrls = post.images?.map(storageId => 
    useQuery(api.files.getImageUrl, { storageId })
  ).filter(Boolean) || [];

  // Get URLs for videos
  const videoUrls = post.videos?.map(storageId => 
    useQuery(api.files.getImageUrl, { storageId })
  ).filter(Boolean) || [];

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${color} border-none shadow-sm hover:shadow-md transition-shadow p-4 rounded-2xl`}>
        <div className="flex gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={userImageUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                {post.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            {userPresence?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-slate-900">{post.user?.name || "Anonymous"}</span>
              <span className="text-xs text-slate-500">
                {new Date(post._creationTime).toLocaleDateString()}
              </span>
            </div>
            
            <p className="text-sm mb-3 leading-relaxed text-slate-800">{post.content}</p>
            
            {/* Display legacy single image */}
            {post.image && (
              <img 
                src={post.image} 
                alt="Post" 
                className="rounded-xl mb-3 w-full object-cover max-h-64"
              />
            )}

            {/* Display multiple images */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {imageUrls.map((url, idx) => url && (
                  <img 
                    key={idx}
                    src={url} 
                    alt={`Post image ${idx + 1}`} 
                    className="rounded-xl w-full object-cover max-h-64"
                  />
                ))}
              </div>
            )}

            {/* Display videos */}
            {videoUrls.length > 0 && (
              <div className="space-y-2 mb-3">
                {videoUrls.map((url, idx) => url && (
                  <video 
                    key={idx}
                    src={url} 
                    controls
                    className="rounded-xl w-full max-h-64"
                  />
                ))}
              </div>
            )}
            
            {post.serviceDetails && (
              <div className="bg-white/50 rounded-xl p-3 mb-3 border border-white">
                <div className="font-semibold text-sm mb-1 text-slate-900">{post.serviceDetails.title}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{post.serviceDetails.category}</span>
                  <span className="font-bold text-sm text-slate-900">${post.serviceDetails.price}/day</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 hover:bg-white/50 active:scale-95 transition-all duration-150"
                onClick={handleLike}
              >
                <motion.div animate={isLiked ? { scale: [1, 1.2, 1] } : {}}>
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-400 text-red-400' : 'text-slate-900'}`} strokeWidth={1.5} />
                </motion.div>
                <span className="text-xs text-slate-900">{post.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 hover:bg-white/50 active:scale-95 transition-all duration-150"
                onClick={onReply}
              >
                <MessageCircle className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                <span className="text-xs text-slate-900">{post.replies}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 hover:bg-white/60 hover:shadow-sm active:scale-95 transition-all duration-150"
              >
                <Share2 className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}