import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

interface PostCardProps {
  post: Doc<"posts"> & { user: Doc<"users"> | null };
  onReply?: () => void;
  onLike?: () => void;
  color?: string;
}

export function PostCard({ post, onReply, onLike, color = "bg-yellow-50" }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

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
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={post.user?.image} />
            <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
              {post.user?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{post.user?.name || "Anonymous"}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(post._creationTime).toLocaleDateString()}
              </span>
            </div>
            
            <p className="text-sm mb-3 leading-relaxed">{post.content}</p>
            
            {post.image && (
              <img 
                src={post.image} 
                alt="Post" 
                className="rounded-xl mb-3 w-full object-cover max-h-64"
              />
            )}
            
            {post.serviceDetails && (
              <div className="bg-white/50 rounded-xl p-3 mb-3 border border-white">
                <div className="font-semibold text-sm mb-1">{post.serviceDetails.title}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.serviceDetails.category}</span>
                  <span className="font-bold text-sm">${post.serviceDetails.price}/day</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 hover:bg-white/50"
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                <span className="text-xs">{post.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 hover:bg-white/50"
                onClick={onReply}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{post.replies}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 hover:bg-white/50"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
