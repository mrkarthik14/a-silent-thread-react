import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, UserPlus, UserMinus, MessageCircleMore, Loader2, MoreVertical, Trash2, Edit2, Eye, Users, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CommentSection } from "@/components/CommentSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

interface PostCardProps {
  post: Doc<"posts"> & { user: Doc<"users"> | null };
  onReply?: () => void;
  onLike?: () => void;
  color?: string;
}

export function PostCard({ post, onReply, onLike, color = "bg-yellow-50" }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Check if current user has liked this post
  const userHasLiked = useQuery(api.posts.hasUserLiked, { postId: post._id });

  // Get presence status for post author
  const userPresence = useQuery(
    api.presence.getUserPresence,
    post.user?._id ? { userId: post.user._id } : "skip"
  );

  // Get user profile image URL
  const userImageUrl = useQuery(
    api.files.getImageUrl,
    post.user?.image ? { storageId: post.user.image } : "skip"
  );

  // Check if current user is following the post author
  const checkIsFollowing = useQuery(
    api.follows.isFollowing,
    post.user?._id && currentUser?._id !== post.user._id ? { userId: post.user._id } : "skip"
  );

  // Update local state when query result changes
  useEffect(() => {
    if (userHasLiked !== undefined) {
      setIsLiked(userHasLiked);
    }
  }, [userHasLiked]);

  useEffect(() => {
    if (checkIsFollowing !== undefined) {
      setIsFollowing(checkIsFollowing);
    }
  }, [checkIsFollowing]);

  // Get URLs for images
  const imageUrls = post.images?.map(storageId => 
    useQuery(api.files.getImageUrl, { storageId })
  ).filter(Boolean) || [];

  // Get URLs for videos
  const videoUrls = post.videos?.map(storageId => 
    useQuery(api.files.getImageUrl, { storageId })
  ).filter(Boolean) || [];

  const likePostMutation = useMutation(api.posts.like);
  const followMutation = useMutation(api.follows.follow);
  const deletePostMutation = useMutation(api.posts.deletePost);
  const updatePostMutation = useMutation(api.posts.updatePost);
  const hidePostMutation = useMutation(api.posts.hidePost);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  const handleFollow = async () => {
    if (!post.user?._id) return;
    setLoadingAction("follow");
    try {
      const result = await followMutation({ userId: post.user._id });
      setIsFollowing(result.following);
      toast.success(result.following ? "Following!" : "Unfollowed");
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMessage = () => {
    if (!post.user?._id) return;
    setLoadingAction("message");
    navigate("/messages", { state: { selectedUserId: post.user._id } });
    setTimeout(() => setLoadingAction(null), 500);
  };

  const handleProfileClick = () => {
    if (post.user?._id) {
      navigate(`/profile/${post.user._id}`);
    }
  };

  const handleEditClick = () => {
    setEditContent(post.content);
    setEditTitle(post.serviceDetails?.title || "");
    setEditCategory(post.serviceDetails?.category || "");
    setEditPrice(post.serviceDetails?.price?.toString() || "");
    setEditLocation(post.serviceDetails?.location || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setIsEditing(true);
    try {
      await updatePostMutation({
        postId: post._id,
        content: editContent,
        serviceDetails: post.type === "service" ? {
          title: editTitle,
          price: parseFloat(editPrice),
          category: editCategory,
          location: editLocation || undefined,
        } : undefined,
      });
      toast.success("Post updated successfully");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update post");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setLoadingAction("delete");
    try {
      await deletePostMutation({ postId: post._id });
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleHidePost = async () => {
    setLoadingAction("hide");
    try {
      await hidePostMutation({ postId: post._id });
      toast.success("Post hidden");
    } catch (error) {
      toast.error("Failed to hide post");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${color} border-none shadow-sm hover:shadow-md transition-shadow p-4 rounded-2xl`}>
        <div className="flex gap-3">
          <motion.div 
            className="relative cursor-pointer" 
            onClick={handleProfileClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={userImageUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                {post.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            {userPresence?.isOnline && (
              <motion.div 
                className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              />
            )}
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span 
                  className="font-semibold text-sm text-slate-900 cursor-pointer hover:text-purple-600 transition-colors"
                  onClick={handleProfileClick}
                >
                  {post.user?.name || "Anonymous"}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(post._creationTime).toLocaleDateString()}
                </span>
              </div>
              
              {/* Follow/Message Buttons - Right of Username */}
              {currentUser?._id !== post.user?._id && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-purple-100/50 active:scale-95 transition-all duration-150"
                    onClick={handleFollow}
                    disabled={loadingAction === "follow"}
                    title={isFollowing ? "Following" : "Follow"}
                  >
                    {loadingAction === "follow" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-600" strokeWidth={1.5} />
                    ) : isFollowing ? (
                      <Users className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                    ) : (
                      <UserPlus className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-blue-100/50 active:scale-95 transition-all duration-150"
                    onClick={handleMessage}
                    disabled={loadingAction === "message"}
                    title="Message"
                  >
                    {loadingAction === "message" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-600" strokeWidth={1.5} />
                    ) : (
                      <Mail className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                    )}
                  </Button>
                </div>
              )}
              
              {/* Post Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  {currentUser?._id === post.user?._id ? (
                    <>
                      <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
                        <Edit2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDeletePost} className="cursor-pointer text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
                        Delete
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={handleHidePost} className="cursor-pointer">
                      <Eye className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      Not Interested
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-sm mb-3 leading-relaxed text-slate-800">{post.content}</p>
            
            {/* Display legacy single image */}
            {post.image && (
              <img 
                src={post.image} 
                alt="Post" 
                className="rounded-xl mb-3 w-full object-cover max-h-64"
              />
            )}

            {/* Display multiple images */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {imageUrls.map((url, idx) => url && (
                  <img 
                    key={idx}
                    src={url} 
                    alt={`Post image ${idx + 1}`} 
                    className="rounded-xl w-full object-cover max-h-64"
                  />
                ))}
              </div>
            )}

            {/* Display videos */}
            {videoUrls.length > 0 && (
              <div className="space-y-2 mb-3">
                {videoUrls.map((url, idx) => url && (
                  <video 
                    key={idx}
                    src={url} 
                    controls
                    className="rounded-xl w-full max-h-64"
                  />
                ))}
              </div>
            )}
            
            {post.serviceDetails && (
              <div className="bg-white/50 rounded-xl p-3 mb-3 border border-white">
                <div className="font-black text-base mb-2 text-black">{post.serviceDetails.title}</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                      {post.serviceDetails.category}
                    </span>
                  </div>
                  {post.serviceDetails.location && (
                    <div className="text-xs text-slate-600 font-medium">
                      📍 {post.serviceDetails.location}
                    </div>
                  )}
                  <div className="pt-1">
                    <span className="font-extrabold text-sm text-slate-900">₹{post.serviceDetails.price}/day</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 hover:bg-white/50 active:scale-95 transition-all duration-150"
                onClick={handleLike}
              >
                <motion.div animate={isLiked ? { scale: [1, 1.2, 1] } : {}}>
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-400 text-red-400' : 'text-slate-900'}`} strokeWidth={1.5} />
                </motion.div>
                <span className="text-xs text-slate-900">{post.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 hover:bg-white/50 active:scale-95 transition-all duration-150"
                onClick={onReply}
              >
                <MessageCircle className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                <span className="text-xs text-slate-900">{post.replies}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 hover:bg-white/60 hover:shadow-sm active:scale-95 transition-all duration-150"
              >
                <Share2 className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
              </Button>
            </div>

            {post.type === "service" && currentUser?._id !== post.user?._id && (
              <Button
                onClick={() => setBookingDialogOpen(true)}
                className="w-full rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white active:scale-95 transition-all duration-150 mt-3"
              >
                Book Now
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Book {post.serviceDetails?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Preferred Date</Label>
              <Input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                placeholder="Tell the owner about your booking request..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleBooking}
                disabled={isBooking}
                className="flex-1 rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-70"
              >
                {isBooking ? "Booking..." : "Send Request"}
              </Button>
              <Button
                onClick={() => setBookingDialogOpen(false)}
                variant="outline"
                className="flex-1 rounded-xl active:scale-95 transition-all duration-150"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Content</Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>

            {post.type === "service" && (
              <>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Service title"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="e.g., Electronics"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Price per day (₹)</Label>
                    <Input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="50"
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g., Downtown"
                    className="rounded-xl"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveEdit}
                disabled={isEditing}
                className="flex-1 rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-70"
              >
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => setEditDialogOpen(false)}
                variant="outline"
                className="flex-1 rounded-xl active:scale-95 transition-all duration-150"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}