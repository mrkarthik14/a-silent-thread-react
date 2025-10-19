import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router";

export default function Services() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const posts = useQuery(api.posts.list, {});
  const services = posts?.filter(p => p.type === "service");

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

  const colors = ["bg-[#D4E8D4]", "bg-[#D4E4F0]", "bg-[#FFE5B4]", "bg-[#FFE5D9]", "bg-[#E5D4F7]"];

  return (
    <div className="flex h-screen bg-[#F5F3EF]">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold tracking-tight text-[#4A4A4A]">Services</h1>
            <p className="text-[#8B8B8B]">Discover and rent amazing things</p>
          </motion.div>

          <div className="grid gap-4">
            {services?.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard
                  post={service}
                  color={colors[index % colors.length]}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}