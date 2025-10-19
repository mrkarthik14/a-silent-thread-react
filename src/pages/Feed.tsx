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
  
  const posts = useQuery(api.posts.list, {});
  const likePost = useMutation(api.posts.like);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F3EF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A5A5]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const colors = ["bg-[#FFE5D9]", "bg-[#D4E8D4]", "bg-[#E5D4F7]", "bg-[#FFE5B4]", "bg-[#D4E4F0]"];

  return (
    <div className="flex h-screen bg-[#F5F3EF]">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 sticky top-0 z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B8B8B]" />
              <Input
                placeholder="Search threads..."
                className="pl-10 rounded-xl border-[#E8E4DC] bg-white"
              />
            </div>
          </motion.div>

          <div className="space-y-4">
            {posts?.map((post, index) => (
              <div key={post._id} className="relative">
                {index > 0 && (
                  <div className="absolute -top-2 left-8 w-0.5 h-4">
                    <ThreadLine color="bg-[#D4A5A5]" vertical />
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