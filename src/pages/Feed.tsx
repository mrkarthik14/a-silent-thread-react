import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { ThreadLine } from "@/components/ThreadLine";
import { SuggestedFollowers } from "@/components/SuggestedFollowers";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { motion } from "framer-motion";
import { Loader2, Search, Users, FileText, Package } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function Feed() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "posts" | "listings">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  // Track presence
  usePresence();
  
  const posts = useQuery(api.posts.list, {});
  const likePost = useMutation(api.posts.like);
  
  const searchResults = useQuery(api.search.globalSearch, {
    query: searchQuery,
    type: searchType === "all" ? undefined : searchType,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });

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
    "bg-gradient-to-br from-blue-100 to-blue-200"
  ];

  const getColorForIndex = (index: number) => {
    const colorIndex = index % colors.length;
    if (index > 0 && colorIndex === ((index - 1) % colors.length)) {
      return colors[(colorIndex + 1) % colors.length];
    }
    return colors[colorIndex];
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 sticky top-0 z-10 bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200"
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-900" strokeWidth={1.5} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads, listings, users..."
                className="pl-10 rounded-xl border-slate-200 bg-white/80"
              />
            </div>

            {isSearching && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={searchType === "all" ? "default" : "outline"}
                    onClick={() => setSearchType("all")}
                    size="sm"
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white border-0"
                  >
                    All
                  </Button>
                  <Button
                    variant={searchType === "users" ? "default" : "outline"}
                    onClick={() => setSearchType("users")}
                    size="sm"
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white border-0"
                  >
                    Users
                  </Button>
                  <Button
                    variant={searchType === "posts" ? "default" : "outline"}
                    onClick={() => setSearchType("posts")}
                    size="sm"
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white border-0"
                  >
                    Posts
                  </Button>
                  <Button
                    variant={searchType === "listings" ? "default" : "outline"}
                    onClick={() => setSearchType("listings")}
                    size="sm"
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white border-0"
                  >
                    Listings
                  </Button>
                </div>

                {(searchType === "listings" || searchType === "all") && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min price"
                      className="rounded-xl text-sm border-slate-200"
                    />
                    <Input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max price"
                      className="rounded-xl text-sm border-slate-200"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {isSearching && searchResults ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 mb-6"
            >
              {/* Users */}
              {searchResults.users && searchResults.users.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Users
                  </h3>
                  <div className="space-y-2">
                    {searchResults.users.map((user: any, idx: number) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => navigate(`/profile/${user._id}`)}
                        className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                            {user.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-600">{user.email}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {searchResults.posts && searchResults.posts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Posts
                  </h3>
                  <div className="space-y-2">
                    {searchResults.posts.map((post: any, idx: number) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 cursor-pointer transition-colors"
                      >
                        <p className="text-sm text-slate-900 line-clamp-2">{post.content}</p>
                        <p className="text-xs text-slate-500 mt-1">Likes: {post.likes}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Listings */}
              {searchResults.listings && searchResults.listings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Listings
                  </h3>
                  <div className="space-y-2">
                    {searchResults.listings.map((listing: any, idx: number) => (
                      <motion.div
                        key={listing._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-900">{listing.serviceDetails?.title}</p>
                        <p className="text-xs text-slate-600">₹{listing.serviceDetails?.price}/day</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{listing.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.users?.length === 0 && searchResults.posts?.length === 0 && searchResults.listings?.length === 0 && (
                <p className="text-center text-slate-600 py-8">No results found</p>
              )}
            </motion.div>
          ) : (
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
                    color={getColorForIndex(index)}
                    onLike={() => likePost({ postId: post._id })}
                  />
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Suggested Followers Sidebar */}
          <div className="hidden lg:block">
            <SuggestedFollowers />
          </div>
        </div>
      </div>
    </div>
  );
}