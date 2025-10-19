import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { ThreadLine } from "@/components/ThreadLine";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";

export default function Feed() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const posts = useQuery(api.posts.list, {});
  const likePost = useMutation(api.posts.like);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const colors = ["bg-gradient-to-br from-pink-100 to-pink-200", "bg-gradient-to-br from-yellow-100 to-yellow-200", "bg-gradient-to-br from-emerald-100 to-emerald-200", "bg-gradient-to-br from-purple-100 to-purple-200", "bg-gradient-to-br from-blue-100 to-blue-200"];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 sticky top-0 z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search threads..."
                className="pl-10 rounded-xl border-slate-200 bg-white"
              />
            </div>
          </motion.div>

          <div className="space-y-4">
            {posts?.map((post, index) => (
              <div key={post._id} className="relative">
                {index > 0 && (
                  <div className="absolute -top-2 left-8 w-0.5 h-4">
                    <ThreadLine color="bg-purple-300" vertical />
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