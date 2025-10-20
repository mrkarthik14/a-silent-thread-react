import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { motion } from "framer-motion";
import { Loader2, Camera } from "lucide-react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { PostCard } from "@/components/PostCard";

export default function Profile() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Track presence
  usePresence();

  const profileData = useQuery(api.profile.getCurrentUserProfile, {});

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" strokeWidth={1.5} />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const colors = [
    "bg-gradient-to-br from-pink-100 to-pink-200",
    "bg-gradient-to-br from-yellow-100 to-yellow-200",
    "bg-gradient-to-br from-emerald-100 to-emerald-200",
    "bg-gradient-to-br from-purple-100 to-purple-200",
    "bg-gradient-to-br from-blue-100 to-blue-200",
  ];

  const getColorForIndex = (index: number) => {
    const colorIndex = index % colors.length;
    if (index > 0 && colorIndex === (index - 1) % colors.length) {
      return colors[(colorIndex + 1) % colors.length];
    }
    return colors[colorIndex];
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-64 bg-gradient-to-br from-purple-300 to-blue-300 rounded-b-3xl overflow-hidden"
          >
            {profileData?.coverImage ? (
              <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="h-12 w-12 text-white/50" strokeWidth={1.5} />
              </div>
            )}
          </motion.div>

          {/* Profile Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-6"
          >
            <div className="flex items-end gap-4 -mt-16 mb-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileData?.image} />
                <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-2xl">
                  {profileData?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              {user?._id === profileData?._id && (
                <Button className="rounded-xl mb-2">
                  <Camera className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{profileData?.name || "User"}</h1>
              <p className="text-slate-600 mb-4">{profileData?.email}</p>

              {profileData?.bio && (
                <p className="text-slate-700 mb-4">{profileData.bio}</p>
              )}

              {profileData?.interests && profileData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, idx) => (
                    <Badge key={idx} className="bg-purple-200 text-purple-900 rounded-full">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Posts and Services */}
          <div className="px-6 pb-6">
            <div className="grid gap-6">
              {/* Services Section */}
              {profileData?.posts && profileData.posts.some((p) => p.type === "service") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Services</h2>
                  <div className="space-y-4">
                    {profileData.posts
                      .filter((p) => p.type === "service")
                      .map((post, idx) => (
                        <PostCard key={post._id} post={post} color={getColorForIndex(idx)} />
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Posts Section */}
              {profileData?.posts && profileData.posts.some((p) => p.type === "post") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Posts</h2>
                  <div className="space-y-4">
                    {profileData.posts
                      .filter((p) => p.type === "post")
                      .map((post, idx) => (
                        <PostCard key={post._id} post={post} color={getColorForIndex(idx)} />
                      ))}
                  </div>
                </motion.div>
              )}

              {!profileData?.posts || profileData.posts.length === 0 && (
                <div className="text-center py-12 text-slate-600">
                  No posts yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
