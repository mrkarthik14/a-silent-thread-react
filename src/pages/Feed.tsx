import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { ThreadLine } from "@/components/ThreadLine";
import { SuggestedFollowers } from "@/components/SuggestedFollowers";
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
import Masonry from "@/components/Masonry";

export default function Feed() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "posts" | "listings">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
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
  
  const paginatedPosts = useQuery(api.posts.listPaginated, { paginationOpts });
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
    "bg-gradient-to-br from-pink-100 to-pink-200", 
    "bg-gradient-to-br from-yellow-100 to-yellow-200", 
    "bg-gradient-to-br from-emerald-100 to-emerald-200", 
    "bg-gradient-to-br from-purple-100 to-purple-200", 
    "bg-gradient-to-br from-blue-100 to-blue-200",
    "bg-gradient-to-br from-rose-100 to-rose-200",
    "bg-gradient-to-br from-orange-100 to-orange-200",
    "bg-gradient-to-br from-cyan-100 to-cyan-200",
    "bg-gradient-to-br from-indigo-100 to-indigo-200",
    "bg-gradient-to-br from-teal-100 to-teal-200",
    "bg-gradient-to-br from-fuchsia-100 to-fuchsia-200",
    "bg-gradient-to-br from-lime-100 to-lime-200"
  ];

  const getColorForIndex = (index: number) => {
    const colorIndex = index % colors.length;
    if (index > 0 && colorIndex === ((index - 1) % colors.length)) {
      return colors[(colorIndex + 1) % colors.length];
    }
    return colors[colorIndex];
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-700 dark:via-slate-700 dark:to-slate-700 transition-colors duration-500">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto feed-scroll bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-700 dark:via-slate-700 dark:to-slate-700 transition-colors duration-500">
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block"></div>
          <div className="lg:col-span-2">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 sticky top-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-900 dark:text-slate-100" strokeWidth={1.5} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search threads, listings, users..."
                  className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
                />
              </div>
              <Button
                onClick={handleDarkModeToggle}
                className={`rounded-full p-2.5 font-semibold transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  darkMode
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border border-indigo-500"
                    : "bg-gradient-to-r from-yellow-300 to-amber-300 text-amber-950 hover:from-yellow-400 hover:to-amber-400 border border-yellow-400"
                }`}
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? (
                  <Moon className="h-6 w-6 transition-transform duration-500 rotate-0" strokeWidth={1.5} />
                ) : (
                  <Sun className="h-6 w-6 transition-transform duration-500 rotate-0" strokeWidth={1.5} />
                )}
              </Button>
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
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
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
                        className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-slate-800 rounded-lg hover:bg-purple-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                            {user.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {searchResults.posts && searchResults.posts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
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
                        className="p-3 bg-yellow-50 dark:bg-slate-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2">{post.content}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Likes: {post.likes}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Listings - Masonry Grid */}
              {searchResults.listings && searchResults.listings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Listings
                  </h3>
                  <div className="h-96">
                    <Masonry
                      items={searchResults.listings.map((listing: any) => ({
                        id: listing._id,
                        img: listing.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image",
                        url: `/services/${listing._id}`,
                        height: Math.random() * 200 + 200
                      }))}
                      ease="power3.out"
                      duration={0.6}
                      stagger={0.05}
                      animateFrom="bottom"
                      scaleOnHover={true}
                      hoverScale={0.95}
                      blurToFocus={true}
                      colorShiftOnHover={false}
                    />
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.users?.length === 0 && searchResults.posts?.length === 0 && searchResults.listings?.length === 0 && (
                <p className="text-center text-slate-600 dark:text-slate-400 py-8">No results found</p>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {allPosts?.map((post, index) => (
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
              
              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="py-8 flex justify-center">
                {paginatedPosts?.isDone === false && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-slate-600"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    <span className="text-sm">Loading more posts...</span>
                  </motion.div>
                )}
                {paginatedPosts?.isDone && allPosts.length > 0 && (
                  <p className="text-sm text-slate-500">No more posts</p>
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