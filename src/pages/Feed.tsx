import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { ThreadLine } from "@/components/ThreadLine";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";

export default function Feed() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  const posts = useQuery(api.posts.list, {});
  const createPost = useMutation(api.posts.create);
  const likePost = useMutation(api.posts.like);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    setIsPosting(true);
    try {
      await createPost({
        content: newPost,
        type: "post",
      });
      setNewPost("");
      toast.success("Posted successfully!");
    } catch (error) {
      toast.error("Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  const colors = ["bg-yellow-50", "bg-pink-50", "bg-green-50", "bg-purple-50", "bg-blue-50"];

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 sticky top-0 z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
          >
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threads..."
                className="pl-10 rounded-xl border-pink-100"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-4 shadow-sm"
          >
            <Textarea
              placeholder="Share something..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="mb-3 rounded-xl border-white bg-white/50 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={handlePost}
                disabled={isPosting || !newPost.trim()}
                className="rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
              >
                {isPosting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Post
              </Button>
            </div>
          </motion.div>

          <div className="space-y-4">
            {posts?.map((post, index) => (
              <div key={post._id} className="relative">
                {index > 0 && (
                  <div className="absolute -top-2 left-8 w-0.5 h-4">
                    <ThreadLine color="bg-pink-300" vertical />
                  </div>
                )}
                <PostCard
                  post={post}
                  color={colors[index % colors.length]}
                  onLike={() => likePost({ postId: post._id })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
