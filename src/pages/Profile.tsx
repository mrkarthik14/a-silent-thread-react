import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { motion } from "framer-motion";
import { Loader2, Camera, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate, useParams } from "react-router";
import { PostCard } from "@/components/PostCard";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingLogo } from "@/components/LoadingLogo";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { ScrollTriggeredCard } from "@/components/ScrollTriggeredCard";

export default function Profile() {
  const { isLoading, isAuthenticated, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followerPage, setFollowerPage] = useState(0);
  const [followingPage, setFollowingPage] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for parallax effect
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setScrollY(target.scrollTop);
    };

    const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Track presence
  usePresence();

  // Determine which user to display
  const isOwnProfile = !paramUserId || paramUserId === currentUser?._id;
  const targetUserId = paramUserId ? (paramUserId as Id<"users">) : currentUser?._id;

  // Fetch profile data
  const profileDataArgs = isOwnProfile ? {} : (targetUserId ? { userId: targetUserId } : "skip");
  const profileData = useQuery(
    isOwnProfile 
      ? api.profile.getCurrentUserProfile 
      : api.profile.getUserProfile,
    profileDataArgs as any
  );

  const updateProfile = useMutation(api.profile.updateProfile);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const followMutation = useMutation(api.follows.follow);

  // Fetch image URLs
  const profileImageUrl = useQuery(
    api.files.getImageUrl,
    profileData?.image ? { storageId: profileData.image } : "skip"
  );
  const coverImageUrl = useQuery(
    api.files.getImageUrl,
    profileData?.coverImage ? { storageId: profileData.coverImage } : "skip"
  );

  // Get follower/following counts - only query when profileData is available
  const followerCountArgs = profileData ? { userId: profileData._id } : "skip";
  const followerCount = useQuery(
    api.follows.getFollowerCount,
    followerCountArgs as any
  ) ?? 0;

  const followingCountArgs = profileData ? { userId: profileData._id } : "skip";
  const followingCount = useQuery(
    api.follows.getFollowingCount,
    followingCountArgs as any
  ) ?? 0;

  // Check if following this user
  const checkIsFollowing = useQuery(
    api.follows.isFollowing,
    targetUserId && !isOwnProfile ? { userId: targetUserId } : "skip"
  );

  // Sync the query result with local state
  useEffect(() => {
    if (checkIsFollowing !== undefined && !isOwnProfile) {
      setIsFollowing(checkIsFollowing);
    }
  }, [checkIsFollowing, isOwnProfile]);

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

  const ITEMS_PER_PAGE = 10;

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

  const handleEditClick = () => {
    setEditName(profileData?.name || "");
    setEditBio(profileData?.bio || "");
    setEditInterests(profileData?.interests?.join(", ") || "");
    setProfileImagePreview(profileImageUrl || "");
    setProfileImageFile(null);
    setCoverImagePreview(coverImageUrl || "");
    setCoverImageFile(null);
    setEditDialogOpen(true);
  };

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      let uploadedImageUrl = profileData?.image;
      let uploadedCoverUrl = profileData?.coverImage;

      // Upload profile picture if selected
      if (profileImageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": profileImageFile.type },
          body: profileImageFile,
        });
        const { storageId } = await result.json();
        uploadedImageUrl = storageId;
      }

      // Upload cover image if selected
      if (coverImageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": coverImageFile.type },
          body: coverImageFile,
        });
        const { storageId } = await result.json();
        uploadedCoverUrl = storageId;
      }

      const interestsArray = editInterests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      await updateProfile({
        name: editName,
        bio: editBio,
        interests: interestsArray.length > 0 ? interestsArray : undefined,
        coverImage: uploadedCoverUrl || undefined,
        image: uploadedImageUrl || undefined,
      });

      toast.success("Profile updated successfully");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFollow = async () => {
    if (!targetUserId) return;
    try {
      await followMutation({ userId: targetUserId });
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    } catch (error) {
      toast.error("Failed to follow user");
    }
  };

  const handleMessage = () => {
    if (targetUserId) {
      navigate("/messages", { state: { selectedUserId: targetUserId } });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-300/30 dark:bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-300/30 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[50%] h-[50%] rounded-full bg-pink-300/30 dark:bg-pink-900/20 blur-[120px]" />
      </div>

      {/* Glass Overlay & Content */}
      <div className="relative z-10 flex w-full h-full bg-white/40 dark:bg-slate-950/40 backdrop-blur-3xl saturate-150 transition-colors duration-300">
        <Sidebar />

        <div className="flex-1 overflow-y-auto ml-0 md:ml-20">
        <div className="max-w-4xl mx-auto">
          {/* Cover Image with Parallax Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-64 bg-gradient-to-br from-purple-300 to-blue-300 dark:from-purple-700 dark:to-blue-700 rounded-b-3xl overflow-hidden group cursor-pointer transition-colors duration-500"
            style={{ y: scrollY * 0.5 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {coverImageUrl ? (
              <motion.img 
                src={coverImageUrl} 
                alt="Cover" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                style={{ y: scrollY * 0.3 }}
                whileHover={{ scale: 1.05 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                <Camera className="h-12 w-12 text-white/50 group-hover:text-white/80 transition-colors duration-300" strokeWidth={1.5} />
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
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileImageUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-2xl">
                    {profileData?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <Camera className="h-5 w-5 text-slate-900" strokeWidth={1.5} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-2 mb-2">
                {isOwnProfile && (
                  <Button 
                    onClick={handleEditClick}
                    className="rounded-xl hover:shadow-md active:scale-95 transition-all duration-150"
                  >
                    <Camera className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    Edit Profile
                  </Button>
                )}
                {!isOwnProfile && currentUser?._id && (
                  <>
                    <Button
                      onClick={handleFollow}
                      disabled={isFollowLoading}
                      variant="outline"
                      className="rounded-xl hover:bg-purple-100 active:scale-95 transition-all duration-150 disabled:opacity-70"
                    >
                      {isFollowLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleMessage}
                      className="rounded-xl bg-blue-200 hover:bg-blue-300 text-blue-900 active:scale-95 transition-all duration-150"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{profileData?.name || "User"}</h1>
                  <p className="text-slate-600 dark:text-slate-300">{profileData?.email}</p>
                </div>

                {/* Follower/Following counts */}
                <motion.div 
                  className="flex gap-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.button
                    onClick={() => {}}
                    className="text-center hover:scale-110 active:scale-95 transition-transform"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.p 
                      className="text-2xl font-bold text-slate-900"
                      key={followerCount}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {followerCount}
                    </motion.p>
                    <p className="text-xs text-slate-600">Followers</p>
                  </motion.button>
                  <motion.button
                    onClick={() => {}}
                    className="text-center hover:scale-110 active:scale-95 transition-transform"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.p 
                      className="text-2xl font-bold text-slate-900"
                      key={followingCount}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {followingCount}
                    </motion.p>
                    <p className="text-xs text-slate-600">Following</p>
                  </motion.button>
                </motion.div>
              </div>

              {profileData?.bio && (
                <motion.p 
                  className="text-slate-700 dark:text-slate-200 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {profileData.bio}
                </motion.p>
              )}

              {profileData?.interests && profileData.interests.length > 0 && (
                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {profileData.interests.map((interest, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                    >
                      <Badge className="bg-purple-200 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100 rounded-full hover:shadow-md transition-shadow cursor-pointer">
                        {interest}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Posts and Services Feed */}
          <div className="px-6 pb-6">
            <div className="relative">
              {/* Feed-like layout for posts */}
              <motion.div 
                className="max-w-2xl mx-auto space-y-6"
                style={{ y: scrollY * 0.1 }}
              >
                {profileData?.posts && profileData.posts.length > 0 ? (
                  profileData.posts.map((post, idx) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ 
                    delay: idx * 0.08,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -8,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                      {/* Connection thread lines */}
                      {idx > 0 && (
                        <>
                          <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-gradient-to-b from-purple-300 to-transparent" />
                          <div className="absolute -left-8 top-1/2 h-0.5 w-8 bg-gradient-to-r from-purple-300 to-transparent" />
                        </>
                      )}
                      <PostCard key={post._id} post={post} color={getColorForIndex(idx)} />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-600 dark:text-slate-300">
                    No posts yet
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog (only for own profile) */}
      {isOwnProfile && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-slate-200">
                    <AvatarImage src={profileImagePreview} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                      {editName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="cursor-pointer">
                    <Button variant="outline" className="rounded-xl" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" strokeWidth={1.5} />
                        Upload Picture
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label>Interests (comma-separated)</Label>
                <Input
                  value={editInterests}
                  onChange={(e) => setEditInterests(e.target.value)}
                  placeholder="e.g., Photography, Travel, Music"
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label>Cover Image</Label>
                <div className="space-y-2">
                  {coverImagePreview && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden">
                      <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <Button variant="outline" className="rounded-xl w-full" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" strokeWidth={1.5} />
                        Upload Cover Image
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="flex-1 rounded-xl hover:bg-slate-900 active:scale-95 transition-all duration-150 disabled:opacity-70"
                >
                  {isUpdating ? (
                    <LoadingLogo size="sm" variant="handshake" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  onClick={() => setEditDialogOpen(false)}
                  variant="outline"
                  className="flex-1 rounded-xl hover:bg-slate-50 active:scale-95 transition-all duration-150"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}