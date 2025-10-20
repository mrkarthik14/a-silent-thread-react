import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Search, Users, FileText, Package } from "lucide-react";
import { useNavigate } from "react-router";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "posts" | "listings">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  const results = useQuery(api.search.globalSearch, {
    query: searchQuery,
    type: searchType === "all" ? undefined : searchType,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onOpenChange(false);
  };

  const handlePostClick = (postId: string) => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Threads, Posts & Listings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-900" strokeWidth={1.5} />
            <Input
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search users, posts, listings..."
              className="pl-10 rounded-xl"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={searchType === "all" ? "default" : "outline"}
              onClick={() => setSearchType("all")}
              size="sm"
              className="rounded-xl"
            >
              All
            </Button>
            <Button
              variant={searchType === "users" ? "default" : "outline"}
              onClick={() => setSearchType("users")}
              size="sm"
              className="rounded-xl"
            >
              Users
            </Button>
            <Button
              variant={searchType === "posts" ? "default" : "outline"}
              onClick={() => setSearchType("posts")}
              size="sm"
              className="rounded-xl"
            >
              Posts
            </Button>
            <Button
              variant={searchType === "listings" ? "default" : "outline"}
              onClick={() => setSearchType("listings")}
              size="sm"
              className="rounded-xl"
            >
              Listings
            </Button>
          </div>

          {/* Price Filters */}
          {(searchType === "listings" || searchType === "all") && (
            <div className="flex gap-2">
              <Input
                type="number"
                value={minPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value)}
                placeholder="Min price"
                className="rounded-xl"
              />
              <Input
                type="number"
                value={maxPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value)}
                placeholder="Max price"
                className="rounded-xl"
              />
            </div>
          )}

          {/* Results */}
          <div className="space-y-3 mt-6">
            {results && (
              <>
                {/* Users */}
                {results.users && results.users.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users
                    </h3>
                    <div className="space-y-2">
                      {results.users.map((user: any, idx: number) => (
                        <motion.div
                          key={user._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleUserClick(user._id)}
                          className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors"
                        >
                          <Avatar className="h-8 w-8">
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
                {results.posts && results.posts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Posts
                    </h3>
                    <div className="space-y-2">
                      {results.posts.map((post: any, idx: number) => (
                        <motion.div
                          key={post._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handlePostClick(post._id)}
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
                {results.listings && results.listings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Listings
                    </h3>
                    <div className="space-y-2">
                      {results.listings.map((listing: any, idx: number) => (
                        <motion.div
                          key={listing._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handlePostClick(listing._id)}
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
                {results.users?.length === 0 && results.posts?.length === 0 && results.listings?.length === 0 && searchQuery && (
                  <p className="text-center text-slate-600 py-8">No results found</p>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}