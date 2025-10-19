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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const colors = ["bg-gradient-to-br from-emerald-100 to-emerald-200", "bg-gradient-to-br from-blue-100 to-blue-200", "bg-gradient-to-br from-yellow-100 to-yellow-200", "bg-gradient-to-br from-pink-100 to-pink-200", "bg-gradient-to-br from-purple-100 to-purple-200"];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Services</h1>
            <p className="text-slate-600">Discover and rent amazing things</p>
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