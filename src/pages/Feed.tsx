import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { ThreadLine } from "@/components/ThreadLine";
import { SuggestedFollowers } from "@/components/SuggestedFollowers";
import { ThemeTransition } from "@/components/ThemeTransition";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { motion } from "framer-motion";
import { Loader2, Search, Users, FileText, Package, Moon, Sun } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Feed() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "posts" | "listings">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterType, setFilterType] = useState<"all" | "following" | "listings">("all");
  const [paginationOpts, setPaginationOpts] = useState({ numItems: 10, cursor: null as string | null });
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
  };
  
  // Track presence
  usePresence();
  
  // Reset pagination when filter changes
  useEffect(() => {
    setAllPosts([]);
    setPaginationOpts({ numItems: 10, cursor: null });
  }, [filterType]);
  
  const paginatedPosts = useQuery(
    filterType === "following" ? api.posts.listByFollowing : 
    filterType === "listings" ? api.posts.listUserListings :
    api.posts.listPaginated,
    { paginationOpts }
  );
  const likePost = useMutation(api.posts.like);
  
  const searchResults = useQuery(api.search.globalSearch, {
    query: searchQuery,
    type: searchType === "all" ? undefined : searchType,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });

  // Update allPosts when paginatedPosts changes
  useEffect(() => {
    if (paginatedPosts?.page) {
      setAllPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newPosts = paginatedPosts.page.filter((p) => !existingIds.has(p._id));
        return [...prev, ...newPosts];
      });
      setIsLoadingMore(false);
    }
  }, [paginatedPosts?.page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && paginatedPosts?.continueCursor && !isLoadingMore && !searchQuery.trim()) {
          setIsLoadingMore(true);
          setPaginationOpts({
            numItems: 10,
            cursor: paginatedPosts.continueCursor,
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [paginatedPosts?.continueCursor, isLoadingMore, searchQuery]);

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
    "bg-gradient-to-br from-pink-200 to-pink-300 dark:from-[#ffb3b3] dark:to-[#ffa5a5]", 
    "bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-[#ffccd5] dark:to-[#ffc0cb]", 
    "bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-[#e9c0f5] dark:to-[#f0c4f7]", 
    "bg-gradient-to-br from-purple-200 to-purple-300 dark:from-[#b8d9f0] dark:to-[#c0e0f5]", 
    "bg-gradient-to-br from-blue-200 to-blue-300 dark:from-[#ffb3b3] dark:to-[#ffa5a5]",
    "bg-gradient-to-br from-rose-200 to-rose-300 dark:from-[#ffccd5] dark:to-[#ffc0cb]",
    "bg-gradient-to-br from-orange-200 to-orange-300 dark:from-[#e9c0f5] dark:to-[#f0c4f7]",
    "bg-gradient-to-br from-cyan-200 to-cyan-300 dark:from-[#b8d9f0] dark:to-[#c0e0f5]",
    "bg-gradient-to-br from-indigo-200 to-indigo-300 dark:from-[#ffb3b3] dark:to-[#ffa5a5]",
    "bg-gradient-to-br from-teal-200 to-teal-300 dark:from-[#ffccd5] dark:to-[#ffc0cb]",
    "bg-gradient-to-br from-fuchsia-200 to-fuchsia-300 dark:from-[#e9c0f5] dark:to-[#f0c4f7]",
    "bg-gradient-to-br from-lime-200 to-lime-300 dark:from-[#b8d9f0] dark:to-[#c0e0f5]"
  ];

  const getColorForIndex = (index: number) => {
    const colorIndex = index % colors.length;
    if (index > 0 && colorIndex === ((index - 1) % colors.length)) {
      return colors[(colorIndex + 1) % colors.length];
    }
    return colors[colorIndex];
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
      <ThemeTransition />
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto feed-scroll bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 relative">
        {/* Dark mode ambient background effects - Minimal for Threads style */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] dark:bg-white/5" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] dark:bg-white/5" />
        </div>

        <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
          <div className="hidden lg:block"></div>
          <div className="lg:col-span-2">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 lg:mb-6 sticky top-0 z-20"
          >
            <div className="glass-panel rounded-2xl p-3 lg:p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:hover:shadow-none hover:border-white/20 dark:border-[#2a2a2a] dark:bg-[#101010]/90 dark:backdrop-blur-xl">
              <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-[#666] group-focus-within:text-slate-900 dark:group-focus-within:text-[#f0f0f0] transition-colors" strokeWidth={1.5} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search threads..."
                    className="pl-10 rounded-xl border-slate-200 dark:border-[#2a2a2a] bg-white/50 dark:bg-[#1a1a1a] text-slate-900 dark:text-[#f0f0f0] h-10 lg:h-11 text-sm lg:text-base focus:bg-white dark:focus:bg-[#202020] transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-[#666]"
                  />
                </div>
                <Button
                  onClick={handleDarkModeToggle}
                  className={`rounded-full p-2 lg:p-2.5 font-semibold transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    darkMode
                      ? "bg-[#1a1a1a] text-[#f0f0f0] border border-[#2a2a2a] hover:bg-[#252525]"
                      : "bg-gradient-to-r from-yellow-300 to-amber-300 text-amber-950 hover:from-yellow-400 hover:to-amber-400 border border-yellow-400"
                  }`}
                  title={darkMode ? "Light mode" : "Dark mode"}
                >
                  {darkMode ? (
                    <Moon className="h-5 w-5 lg:h-6 lg:w-6 transition-transform duration-500 rotate-0" strokeWidth={1.5} />
                  ) : (
                    <Sun className="h-5 w-5 lg:h-6 lg:w-6 transition-transform duration-500 rotate-0" strokeWidth={1.5} />
                  )}
                </Button>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setFilterType("all")}
                  size="sm"
                  className={`rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold transition-all duration-300 ${
                    filterType === "all"
                      ? "bg-slate-900 text-white dark:bg-[#f0f0f0] dark:text-black shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:text-[#a0a0a0] dark:hover:bg-[#252525] dark:hover:text-[#f0f0f0] dark:border dark:border-[#2a2a2a]"
                  }`}
                >
                  All Posts
                </Button>
                <Button
                  onClick={() => setFilterType("following")}
                  size="sm"
                  className={`rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold transition-all duration-300 ${
                    filterType === "following"
                      ? "bg-slate-900 text-white dark:bg-[#f0f0f0] dark:text-black shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:text-[#a0a0a0] dark:hover:bg-[#252525] dark:hover:text-[#f0f0f0] dark:border dark:border-[#2a2a2a]"
                  }`}
                >
                  Following
                </Button>
                <Button
                  onClick={() => setFilterType("listings")}
                  size="sm"
                  className={`rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold transition-all duration-300 ${
                    filterType === "listings"
                      ? "bg-slate-900 text-white dark:bg-[#f0f0f0] dark:text-black shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:text-[#a0a0a0] dark:hover:bg-[#252525] dark:hover:text-[#f0f0f0] dark:border dark:border-[#2a2a2a]"
                  }`}
                >
                  Your Listings
                </Button>
              </div>
            </div>
          </motion.div>

          {searchQuery.trim().length > 0 && searchResults ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 mb-6"
            >
              {/* Users */}
              {searchResults.users && searchResults.users.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0] mb-3 flex items-center gap-2">
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
                        className="flex items-center gap-3 p-3 bg-white dark:bg-[#181818] rounded-xl hover:bg-slate-50 dark:hover:bg-[#202020] cursor-pointer transition-colors border border-slate-100 dark:border-[#2a2a2a]"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-slate-100 dark:bg-[#262626] dark:text-[#f0f0f0]">
                            {user.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-[#f0f0f0]">{user.name}</p>
                          <p className="text-xs text-slate-600 dark:text-[#a0a0a0]">{user.email}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {searchResults.posts && searchResults.posts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0] mb-3 flex items-center gap-2">
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
                        className="p-3 bg-yellow-50 dark:bg-[#181818] dark:border dark:border-[#2a2a2a] rounded-lg hover:bg-yellow-100 dark:hover:bg-[#202020] cursor-pointer transition-colors"
                      >
                        <p className="text-sm text-slate-900 dark:text-[#f0f0f0] line-clamp-2">{post.content}</p>
                        <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-1">Likes: {post.likes}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Listings */}
              {searchResults.listings && searchResults.listings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0] mb-3 flex items-center gap-2">
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
                        className="p-3 bg-emerald-50 dark:bg-[#181818] dark:border dark:border-[#2a2a2a] rounded-lg hover:bg-emerald-100 dark:hover:bg-[#202020] cursor-pointer transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f0f0]">{listing.serviceDetails?.title}</p>
                        <p className="text-xs text-slate-600 dark:text-[#a0a0a0]">₹{listing.serviceDetails?.price}/day</p>
                        <p className="text-xs text-slate-500 dark:text-[#666] mt-1 line-clamp-1">{listing.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.users?.length === 0 && searchResults.posts?.length === 0 && searchResults.listings?.length === 0 && (
                <p className="text-center text-slate-600 dark:text-[#666] py-8">No results found</p>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {allPosts?.map((post, index) => (
                <div key={post._id} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-2 left-8 w-0.5 h-4">
                      <ThreadLine color="bg-slate-200 dark:bg-[#2a2a2a]" vertical />
                    </div>
                  )}
                  <PostCard
                    post={post}
                    color={getColorForIndex(index)}
                    onLike={() => likePost({ postId: post._id })}
                  />
                </div>
              ))}
              
              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="py-8 flex justify-center">
                {paginatedPosts?.isDone === false && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-slate-600 dark:text-[#666]"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    <span className="text-sm">Loading more posts...</span>
                  </motion.div>
                )}
                {paginatedPosts?.isDone && allPosts.length > 0 && (
                  <p className="text-sm text-slate-500 dark:text-[#666]">No more posts</p>
                )}
              </div>
            </div>
          )}
          </div>

          {/* Suggested Followers Sidebar */}
          <div className="hidden lg:block">
            <SuggestedFollowers />
          </div>
          <div className="hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
}