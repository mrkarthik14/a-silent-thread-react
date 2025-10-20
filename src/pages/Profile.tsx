import { Sidebar } from "@/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { motion } from "framer-motion";
import { Loader2, Camera, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router";
import { PostCard } from "@/components/PostCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingLogo } from "@/components/LoadingLogo";

export default function Profile() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  // Track presence
  usePresence();

  const profileData = useQuery(api.profile.getCurrentUserProfile, {});
  const updateProfile = useMutation(api.profile.updateProfile);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  // Fetch image URLs
  const profileImageUrl = useQuery(
    api.files.getImageUrl,
    profileData?.image ? { storageId: profileData.image } : "skip"
  );
  const coverImageUrl = useQuery(
    api.files.getImageUrl,
    profileData?.coverImage ? { storageId: profileData.coverImage } : "skip"
  );

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
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
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
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileImageUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-2xl">
                    {profileData?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {user?._id === profileData?._id && (
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

              {user?._id === profileData?._id && (
              <Button 
                onClick={handleEditClick}
                className="rounded-xl mb-2 hover:shadow-md active:scale-95 transition-all duration-150"
              >
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

          {/* Posts and Services Grid */}
          <div className="px-6 pb-6">
            <div className="relative">
              {/* Combined grid of all posts and services */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
                {profileData?.posts && profileData.posts.length > 0 ? (
                  profileData.posts.map((post, idx) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
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
                  <div className="col-span-full text-center py-12 text-slate-600">
                    No posts yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
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
    </div>
  );
}