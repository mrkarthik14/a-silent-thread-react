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
import { useTheme } from "@/hooks/use-theme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { BookingDialog } from "@/components/BookingDialog";
import { LoadingLogo } from "@/components/LoadingLogo";
import { ImageSlider } from "@/components/ImageSlider";
import { ShareDialog } from "@/components/ShareDialog";
import BounceCards from "@/components/BounceCards";
import { UserHoverCard } from "@/components/UserHoverCard";

interface PostCardProps {
  post: Doc<"posts"> & { user: Doc<"users"> | null };
  onReply?: () => void;
  onLike?: () => void;
  color?: string;
}

export function PostCard({ post, color, onLike }: PostCardProps) {
  const { currentFeedTheme } = useTheme();
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
  const [isShared, setIsShared] = useState(false);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`group relative overflow-hidden rounded-3xl p-5 transition-all duration-300 ${
        // Use glass style in dark mode, keep original color logic in light mode
        "bg-white dark:bg-[#1a1a1a] shadow-sm hover:shadow-md border border-slate-100 dark:border-[#2a2a2a] dark:hover:bg-[#202020]"
      }`}
    >
      {/* Feed Theme Gradient Override if selected, otherwise use default color prop */}
      <div className={`absolute inset-0 opacity-60 dark:opacity-10 transition-opacity duration-300 ${currentFeedTheme?.cardGradient ? currentFeedTheme.cardGradient : color}`} />
      
      {/* Dark mode subtle gradient glow (hidden in light mode) */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none">
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <UserHoverCard userId={post.user?._id} user={post.user}>
                <Avatar className="h-10 w-10 border-2 border-white dark:border-[#2a2a2a] shadow-sm">
                  <AvatarImage src={userImageUrl || undefined} />
                  <AvatarFallback className="bg-slate-100 dark:bg-[#262626] dark:text-[#f0f0f0]">
                    {post.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </UserHoverCard>
              {userPresence?.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#181818] rounded-full shadow-sm" />
              )}
            </div>
            <div>
              <UserHoverCard userId={post.user?._id} user={post.user}>
                <h3 className="font-bold text-slate-900 dark:text-[#f0f0f0] text-sm leading-tight hover:underline cursor-pointer">
                  {post.user?.name || "Anonymous"}
                </h3>
              </UserHoverCard>
              <p className="text-xs text-slate-500 dark:text-[#a0a0a0] font-medium">
                {new Date(post._creationTime).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-purple-100/50 dark:hover:bg-[#333] active:scale-95 transition-all duration-150"
              onClick={handleFollow}
              disabled={loadingAction === "follow"}
              title={isFollowing ? "Following" : "Follow"}
            >
              {loadingAction === "follow" ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-[#a0a0a0]" strokeWidth={1.5} />
              ) : isFollowing ? (
                <Users className="h-4 w-4 text-slate-900 dark:text-[#f0f0f0]" strokeWidth={1.5} />
              ) : (
                <UserPlus className="h-4 w-4 text-slate-900 dark:text-[#f0f0f0]" strokeWidth={1.5} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100/50 dark:hover:bg-[#333] active:scale-95 transition-all duration-150"
              onClick={handleMessage}
              disabled={loadingAction === "message"}
              title="Message"
            >
              {loadingAction === "message" ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-[#a0a0a0]" strokeWidth={1.5} />
              ) : (
                <Mail className="h-4 w-4 text-slate-900 dark:text-[#f0f0f0]" strokeWidth={1.5} />
              )}
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4 text-slate-600 dark:text-[#a0a0a0]" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              {currentUser?._id === post.user?._id ? (
                <>
                  <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer dark:text-[#f0f0f0] dark:focus:bg-[#262626]">
                    <Edit2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteConfirmOpen(true)} className="cursor-pointer text-red-600 dark:text-red-400 dark:focus:bg-[#262626]">
                    <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleHidePost} className="cursor-pointer dark:text-[#f0f0f0] dark:focus:bg-[#262626]">
                  <Eye className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Not Interested
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mb-4">
          {post.content && (
            <p className="text-slate-700 dark:text-[#e4e4e4] text-sm leading-relaxed mb-3 whitespace-pre-wrap">
              {post.content.split(/(@[a-zA-Z0-9_-]+|&[a-zA-Z0-9_-]+)/g).map((part, idx) => {
                if (part.startsWith("@") || part.startsWith("&")) {
                  const mentionName = part.slice(1);
                  return (
                    <motion.span 
                      key={idx} 
                      className="bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-900 dark:text-purple-100 font-semibold px-1.5 py-0.5 rounded-md inline-block mx-0.5 cursor-pointer hover:shadow-md hover:scale-105 transition-all"
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
          )}
          
          {post.image && (
            <motion.div
              layout
              className="rounded-xl mb-3 overflow-hidden flex justify-center bg-slate-100 dark:bg-[#101010]"
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
                <div className="overflow-hidden rounded-lg mb-3 flex justify-center bg-slate-100 dark:bg-[#101010]">
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
            <div className="bg-white/50 dark:bg-[#202020] rounded-xl p-3 mb-3 border border-white dark:border-[#2a2a2a]">
              <div className="font-black text-base text-black dark:text-[#f0f0f0] mb-2">{post.serviceDetails.title}</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-[#e0e0e0] bg-purple-100 dark:bg-purple-900/30 px-2.5 py-1 rounded-lg">
                    {post.serviceDetails.category}
                  </span>
                  {bookingCount && (
                    <span className="text-xs font-medium text-slate-600 dark:text-[#a0a0a0] bg-slate-100 dark:bg-[#262626] px-2.5 py-1 rounded-lg">
                      {bookingCount.total} bookings
                    </span>
                  )}
                </div>
                {post.serviceDetails.location && (
                  <div className="text-xs text-slate-600 dark:text-[#a0a0a0] font-medium">
                    📍 {post.serviceDetails.location}
                  </div>
                )}
                <div className="pt-1">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-[#f0f0f0]">₹{post.serviceDetails.price}/day</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            onClick={handleLike}
            variant="ghost"
            size="sm"
            className={`rounded-full px-3 h-9 transition-all duration-300 ${
              isLiked
                ? "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400"
                : "hover:bg-slate-100 text-slate-600 dark:text-[#a0a0a0] dark:hover:bg-[#262626] dark:hover:text-[#f0f0f0]"
            }`}
          >
            <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-xs font-semibold">{post.likes}</span>
          </Button>

          <Button
            onClick={() => setShowComments(!showComments)}
            variant="ghost"
            size="sm"
            className="rounded-full px-3 h-9 hover:bg-slate-100 text-slate-600 dark:text-[#a0a0a0] dark:hover:bg-[#262626] dark:hover:text-[#f0f0f0] transition-all duration-300"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-semibold">{post.replies ?? 0}</span>
          </Button>

          <Button
            onClick={() => setShareDialogOpen(true)}
            variant="ghost"
            size="sm"
            className="rounded-full px-3 h-9 hover:bg-slate-100 text-slate-600 dark:text-[#a0a0a0] dark:hover:bg-[#262626] dark:hover:text-[#f0f0f0] transition-all duration-300 ml-auto"
          >
            <motion.div
              animate={isShared ? { 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <Share2 className={`h-4 w-4 mr-1.5 ${isShared ? "text-blue-500 dark:text-blue-400" : ""}`} />
            </motion.div>
            <div className="relative h-4 min-w-[1ch] overflow-hidden flex items-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={post.shares}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="text-xs font-semibold block"
                >
                  {post.shares || 0}
                </motion.span>
              </AnimatePresence>
            </div>
          </Button>
          
          <ShareDialog 
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            postId={post._id}
          />
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-[#2a2a2a]">
                <CommentSection postId={post._id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}