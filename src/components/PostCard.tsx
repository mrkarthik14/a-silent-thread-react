import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, UserPlus, UserMinus, MessageCircleMore, Loader2, MoreVertical, Trash2, Edit2, Eye, Users, Mail, Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CommentSection } from "@/components/CommentSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { BookingDialog } from "@/components/BookingDialog";
import { LoadingLogo } from "@/components/LoadingLogo";
import { ImageSlider } from "@/components/ImageSlider";

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
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  // Get booking count for service listings
  const bookingCount = useQuery(
    api.bookings.getBookingCountByService,
    post.type === "service" ? { serviceId: post._id } : "skip"
  );

  // Check if current user has already booked this service
  const userBooking = useQuery(
    api.bookings.getUserBookingForService,
    post.type === "service" && currentUser?._id !== post.user?._id ? { serviceId: post._id } : "skip"
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
  const imageUrls = post.images?.length ? post.images.map(storageId => 
    useQuery(api.files.getImageUrl, { storageId })
  ).filter((url): url is string => !!url) : [];

  // Get URLs for videos
  const videoUrls = post.videos?.length ? post.videos.map(storageId => 
    useQuery(api.files.getImageUrl, { storageId })
  ).filter((url): url is string => !!url) : [];

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
    setLoadingAction("delete");
    try {
      await deletePostMutation({ postId: post._id });
      toast.success("Post deleted successfully");
      // Reload page to refresh posts list
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    } finally {
      setLoadingAction(null);
      setDeleteConfirmOpen(false);
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
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.15, boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)" }}
              whileTap={{ scale: 0.9 }}
            >
              <Avatar className="h-10 w-10 border-2 border-white shadow-md hover:shadow-lg transition-shadow rounded-full">
                <AvatarImage src={userImageUrl || undefined} className="rounded-full" />
                <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 rounded-full">
                  {post.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
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
                <span className="text-xs text-slate-500" title={new Date(post._creationTime).toLocaleString()}>
                  {(() => {
                    const now = Date.now();
                    const diffMs = now - post._creationTime;
                    const diffSecs = Math.floor(diffMs / 1000);
                    const diffMins = Math.floor(diffSecs / 60);
                    const diffHours = Math.floor(diffMins / 60);
                    const diffDays = Math.floor(diffHours / 24);
                    const diffWeeks = Math.floor(diffDays / 7);
                    const diffMonths = Math.floor(diffDays / 30);
                    const diffYears = Math.floor(diffDays / 365);

                    if (diffSecs < 60) return "just now";
                    if (diffMins < 60) return `${diffMins}m ago`;
                    if (diffHours < 24) return `${diffHours}h ago`;
                    if (diffDays < 7) return `${diffDays}d ago`;
                    if (diffWeeks < 4) return `${diffWeeks}w ago`;
                    if (diffMonths < 12) return `${diffMonths}mo ago`;
                    return `${diffYears}y ago`;
                  })()}
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
                      <DropdownMenuItem onClick={() => setDeleteConfirmOpen(true)} className="cursor-pointer text-red-600">
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
                className="rounded-xl mb-3 w-full object-cover max-h-64 cursor-pointer"
                onClick={() => {
                  if (post.image) {
                    setSelectedImageUrl(post.image);
                  }
                }}
              />
            )}

            {/* Display multiple images and videos in Pinterest style */}
            {(imageUrls.length > 0 || videoUrls.length > 0) && (
              <>
                {post.imageLayout === "slider" ? (
                  <ImageSlider images={imageUrls} onImageClick={setSelectedImageUrl} />
                ) : (
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {/* Combine images and videos */}
                    {[
                      ...imageUrls.map((url, idx) => ({ type: 'image', url, idx })),
                      ...videoUrls.map((url, idx) => ({ type: 'video', url, idx }))
                    ].map((media, idx) => (
                      <div key={`${media.type}-${media.idx}`} className="overflow-hidden rounded-lg">
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={`Post image ${media.idx + 1}`} 
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImageUrl(media.url)}
                          />
                        ) : (
                          <video 
                            src={media.url} 
                            controls
                            className="w-full h-48 object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {post.serviceDetails && (
              <div className="bg-white/50 rounded-xl p-3 mb-3 border border-white">
                <div className="font-black text-base text-black mb-2">{post.serviceDetails.title}</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                      {post.serviceDetails.category}
                    </span>
                    {bookingCount && (
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {bookingCount.total} bookings
                      </span>
                    )}
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
            
            <div className="flex items-center gap-4 mb-3 flex-wrap">
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

              {post.serviceDetails && currentUser?._id !== post.user?._id && (
                userBooking ? (
                  <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg border border-purple-300">
                    <span className="text-xs font-semibold text-purple-900">
                      {userBooking.status === "pending" && "📋 Pending"}
                      {userBooking.status === "accepted" && "✓ Accepted"}
                      {userBooking.status === "rejected" && "✕ Rejected"}
                      {userBooking.status === "completed" && "✓ Completed"}
                      {userBooking.status === "cancelled" && "✕ Cancelled"}
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={() => setBookingDialogOpen(true)}
                    className="ml-auto h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold active:scale-95 transition-all duration-150"
                  >
                    Book Now
                  </Button>
                )
              )}
            </div>

          </div>
        </div>
      </Card>

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

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        serviceId={post._id}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePost}
                disabled={loadingAction === "delete"}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                {loadingAction === "delete" ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Image Modal */}
  <Dialog open={selectedImageUrl !== undefined && selectedImageUrl !== null} onOpenChange={(open) => !open && setSelectedImageUrl(undefined)}>
        <DialogContent className="rounded-2xl max-w-3xl p-0 border-0 bg-black/90">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50 hover:bg-white/20"
              onClick={() => setSelectedImageUrl(undefined)}
            >
              <X className="h-6 w-6 text-white" strokeWidth={1.5} />
            </Button>

            {selectedImageUrl && (
              <img
                src={selectedImageUrl}
                alt="Full view"
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <Button
                onClick={() => {
                  if (selectedImageUrl) {
                    const link = document.createElement("a");
                    link.href = selectedImageUrl;
                    link.download = `image-${Date.now()}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Image downloaded");
                  }
                }}
                className="rounded-xl bg-white hover:bg-white/90 text-black font-semibold gap-2"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} />
                Save
              </Button>

              <Button
                onClick={() => {
                  if (selectedImageUrl) {
                    if (navigator.share) {
                      navigator.share({
                        title: "Check out this image",
                        text: "I found this interesting image on A Silent Thread",
                        url: selectedImageUrl,
                      }).catch(() => {
                        toast.error("Share failed");
                      });
                    } else {
                      navigator.clipboard.writeText(selectedImageUrl);
                      toast.success("Image URL copied to clipboard");
                    }
                  }
                }}
                className="rounded-xl bg-white hover:bg-white/90 text-black font-semibold gap-2"
              >
                <Share2 className="h-4 w-4" strokeWidth={1.5} />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}