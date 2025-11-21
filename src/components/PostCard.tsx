import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
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
import { ShareDialog } from "@/components/ShareDialog";
import BounceCards from "@/components/BounceCards";

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
  const [likeError, setLikeError] = useState<string | null>(null);
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
  const [showComments, setShowComments] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const userHasLiked = useQuery(api.posts.hasUserLiked, { postId: post._id });
  const userPresence = useQuery(
    api.presence.getUserPresence,
    post.user?._id ? { userId: post.user._id } : "skip"
  );
  const userImageUrl = useQuery(
    api.files.getImageUrl,
    post.user?.image ? { storageId: post.user.image } : "skip"
  );
  const checkIsFollowing = useQuery(
    api.follows.isFollowing,
    post.user?._id && currentUser?._id !== post.user._id ? { userId: post.user._id } : "skip"
  );
  const bookingCount = useQuery(
    api.bookings.getBookingCountByService,
    post.type === "service" ? { serviceId: post._id } : "skip"
  );
  const userBooking = useQuery(
    api.bookings.getUserBookingForService,
    post.type === "service" && currentUser?._id !== post.user?._id ? { serviceId: post._id } : "skip"
  );
  const shareCount = useQuery(api.share.getShareCount, { postId: post._id }) ?? 0;

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

  const imageUrls = post.images?.length ? post.images.map(storageId => 
    useQuery(api.files.getImageUrl, { storageId })
  ).filter((url): url is string => !!url) : [];

  const videoUrls = post.videos?.length ? post.videos.map(storageId => 
    useQuery(api.files.getImageUrl, { storageId })
  ).filter((url): url is string => !!url) : [];

  useEffect(() => {
    if (post.mentions && post.mentions.length > 0 && currentUser?._id) {
      post.mentions.forEach((mention) => {
        if (mention.type === "user") {
          // Notification will be sent when post is created
        }
      });
    }
  }, [post.mentions, currentUser?._id]);

  const likePostMutation = useMutation(api.posts.like);
  const followMutation = useMutation(api.follows.follow);
  const deletePostMutation = useMutation(api.posts.deletePost);
  const updatePostMutation = useMutation(api.posts.updatePost);
  const hidePostMutation = useMutation(api.posts.hidePost);

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      await likePostMutation({ postId: post._id });
      onLike?.();
    } catch (error) {
      setIsLiked(!isLiked);
      toast.error("Failed to update like");
      console.error("Like error:", error);
    }
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
      console.error("Follow error:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMessage = () => {
    if (!post.user?._id) {
      toast.error("Unable to message this user");
      return;
    }
    setLoadingAction("message");
    try {
      navigate("/messages", { state: { selectedUserId: post.user._id } });
      setTimeout(() => setLoadingAction(null), 500);
    } catch (error) {
      toast.error("Failed to open messages");
      console.error("Message error:", error);
      setLoadingAction(null);
    }
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
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
    >
      <Card className={`${color} border-none shadow-sm hover:shadow-md transition-shadow p-4 rounded-2xl cursor-pointer`}>
        <div className="flex gap-3">
          <motion.div 
            className="relative cursor-pointer" 
            onClick={handleProfileClick}
            layout
          >
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 120, damping: 12 }}
              className="hover:scale-110 active:scale-95 transition-transform"
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
                layout
                className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3, type: "spring" }}
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
            
            <p className="text-sm mb-3 leading-relaxed text-slate-800">
              {post.content.split(/(@[a-zA-Z0-9_-]+|&[a-zA-Z0-9_-]+)/g).map((part, idx) => {
                if (part.startsWith("@") || part.startsWith("&")) {
                  const mentionName = part.slice(1);
                  return (
                    <motion.span 
                      key={idx} 
                      className="bg-gradient-to-r from-purple-200 to-pink-200 text-purple-900 font-semibold px-1.5 py-0.5 rounded-md inline-block mx-0.5 cursor-pointer hover:shadow-md hover:scale-105 transition-all"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        // Search for user with this mention name
                        const mentionedUser = post.mentions?.find(m => m.name.toLowerCase() === mentionName.toLowerCase());
                        if (mentionedUser) {
                          navigate(`/profile/${mentionedUser.id}`);
                        }
                      }}
                      title={`Mentioned: ${mentionName}`}
                    >
                      {part}
                    </motion.span>
                  );
                }
                return part;
              })}
            </p>
            
            {post.image && (
              <motion.div
                layout
                className="rounded-xl mb-3 overflow-hidden flex justify-center"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <img 
                  src={post.image} 
                  alt="Post" 
                  className="rounded-xl object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    maxHeight: "300px",
                    maxWidth: "100%",
                    height: "auto"
                  }}
                  onClick={() => {
                    if (post.image) {
                      setSelectedImageUrl(post.image);
                    }
                  }}
                />
              </motion.div>
            )}

            {(imageUrls.length > 0 || videoUrls.length > 0) && (
              <>
                {imageUrls.length > 1 || videoUrls.length > 1 ? (
                  post.imageLayout === "bounce" ? (
                    <div className="mb-3 flex justify-center">
                      <BounceCards
                        images={imageUrls}
                        containerWidth={400}
                        containerHeight={300}
                        animationDelay={0.3}
                        animationStagger={0.06}
                        easeType="elastic.out(1, 0.8)"
                        enableHover={true}
                        onImageClick={setSelectedImageUrl}
                      />
                    </div>
                  ) : (
                    <ImageSlider images={[...imageUrls, ...videoUrls]} onImageClick={setSelectedImageUrl} />
                  )
                ) : (
                  <div className="overflow-hidden rounded-lg mb-3 flex justify-center">
                    {imageUrls.length > 0 ? (
                      <img 
                        src={imageUrls[0]} 
                        alt="Post image" 
                        className="object-contain cursor-pointer hover:opacity-90 transition-opacity rounded-xl"
                        style={{
                          maxHeight: "300px",
                          maxWidth: "100%",
                          height: "auto"
                        }}
                        onClick={() => setSelectedImageUrl(imageUrls[0])}
                      />
                    ) : (
                      <video 
                        src={videoUrls[0]} 
                        controls
                        className="object-contain rounded-xl"
                        style={{
                          maxHeight: "300px",
                          maxWidth: "100%"
                        }}
                      />
                    )}
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
            
            <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 sm:px-3 gap-1.5 sm:gap-2 hover:bg-red-100/50 active:scale-95 transition-all duration-150 rounded-lg font-semibold disabled:opacity-50 text-xs sm:text-sm"
                onClick={handleLike}
                disabled={loadingAction === "like"}
                title={isLiked ? "Unlike" : "Like"}
                aria-label={`${isLiked ? "Unlike" : "Like"} post. ${post.likes ?? 0} likes`}
                aria-pressed={isLiked}
              >
                <motion.div 
                  layout 
                  animate={isLiked ? { scale: 1.2 } : { scale: 1 }} 
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} strokeWidth={1.5} aria-hidden="true" />
                </motion.div>
                <motion.span 
                  key={`likes-${post.likes}`}
                  initial={{ scale: 0.8, opacity: 0, y: -5 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="text-xs text-slate-700 font-semibold"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {post.likes ?? 0}
                </motion.span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 sm:px-3 gap-1.5 sm:gap-2 hover:bg-blue-100/50 active:scale-95 transition-all duration-150 rounded-lg font-semibold text-xs sm:text-sm"
                onClick={() => setShowComments(!showComments)}
                title={showComments ? "Hide comments" : "Show comments"}
                aria-label={`${showComments ? "Hide" : "Show"} comments. ${post.replies ?? 0} comments`}
                aria-expanded={showComments}
              >
                <MessageCircle className="h-4 w-4 text-slate-700" strokeWidth={1.5} aria-hidden="true" />
                <motion.span 
                  key={`comments-${post.replies}`}
                  initial={{ scale: 0.8, opacity: 0, y: -5 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="text-xs text-slate-700 font-semibold"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {post.replies ?? 0}
                </motion.span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 sm:px-3 gap-1.5 sm:gap-2 hover:bg-purple-100/50 hover:shadow-sm active:scale-95 transition-all duration-150 rounded-lg font-semibold disabled:opacity-50 text-xs sm:text-sm"
                onClick={() => setShareDialogOpen(true)}
                disabled={loadingAction === "share"}
                title="Share post"
                aria-label={`Share post. ${post.shares ?? 0} shares`}
              >
                <motion.div
                  key={`share-icon-${post.shares}`}
                  animate={post.shares ? { rotate: [0, -15, 15, -15, 15, 0], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Share2 className="h-4 w-4 text-slate-700" strokeWidth={1.5} aria-hidden="true" />
                </motion.div>
                <div className="relative h-4 min-w-[1ch] flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span 
                      key={`shares-${post.shares}`}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-xs text-slate-700 font-semibold absolute"
                    >
                      {post.shares ?? 0}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </Button>

              {post.serviceDetails && currentUser?._id !== post.user?._id && (
                userBooking && userBooking.status !== "cancelled" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border-2 shadow-md transition-all ${
                      userBooking.status === "pending" 
                        ? "bg-gradient-to-br from-orange-100 to-amber-100 border-orange-300 text-orange-900"
                        : userBooking.status === "accepted"
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-300 text-emerald-900"
                        : userBooking.status === "rejected"
                        ? "bg-gradient-to-br from-red-100 to-pink-100 border-red-300 text-red-900"
                        : userBooking.status === "completed"
                        ? "bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300 text-blue-900"
                        : "bg-gradient-to-br from-gray-100 to-slate-100 border-gray-300 text-gray-900"
                    }`}
                  >
                    <span>
                      {userBooking.status === "pending" && "⏳ Pending"}
                      {userBooking.status === "accepted" && "✓ Accepted"}
                      {userBooking.status === "rejected" && "✕ Rejected"}
                      {userBooking.status === "completed" && "✓ Completed"}
                    </span>
                  </motion.div>
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

            {showComments && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="mt-4 pt-4 border-t border-white/30"
              >
                <CommentSection postId={post._id} />
              </motion.div>
            )}

          </div>
        </div>
      </Card>

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

      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        serviceId={post._id}
      />

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

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        postId={post._id}
      />

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
                    toast.success("Image downloaded to your device");
                  }
                }}
                className="rounded-xl bg-white hover:bg-white/90 text-black font-semibold gap-2"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} />
                Save
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-xl bg-white hover:bg-white/90 text-black font-semibold gap-2">
                    <Share2 className="h-4 w-4" strokeWidth={1.5} />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="rounded-xl w-48">
                  <DropdownMenuItem
                    onClick={() => {
                      if (selectedImageUrl) {
                        const text = `Check out this image on A Silent Thread: ${selectedImageUrl}`;
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                        window.open(whatsappUrl, "_blank");
                        toast.success("Opening WhatsApp");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <span className="text-green-600 font-semibold">WhatsApp</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (selectedImageUrl) {
                        const text = `Check out this image on A Silent Thread`;
                        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedImageUrl)}`;
                        window.open(facebookUrl, "_blank");
                        toast.success("Opening Facebook");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <span className="text-blue-600 font-semibold">Facebook</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (selectedImageUrl) {
                        const text = `Check out this image on A Silent Thread: ${selectedImageUrl}`;
                        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                        window.open(twitterUrl, "_blank");
                        toast.success("Opening X (Twitter)");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <span className="text-black font-semibold">X (Twitter)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (selectedImageUrl) {
                        const text = `Check out this image on A Silent Thread: ${selectedImageUrl}`;
                        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(selectedImageUrl)}`;
                        window.open(linkedinUrl, "_blank");
                        toast.success("Opening LinkedIn");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <span className="text-blue-700 font-semibold">LinkedIn</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (selectedImageUrl) {
                        const text = `Check out this image on A Silent Thread: ${selectedImageUrl}`;
                        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(selectedImageUrl)}&text=${encodeURIComponent(text)}`;
                        window.open(telegramUrl, "_blank");
                        toast.success("Opening Telegram");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <span className="text-blue-500 font-semibold">Telegram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (selectedImageUrl) {
                        navigator.clipboard.writeText(selectedImageUrl);
                        toast.success("Image URL copied to clipboard");
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <span className="text-slate-600 font-semibold">Copy Link</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}