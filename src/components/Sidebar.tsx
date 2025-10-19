import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Bell, Bookmark, Home, LogOut, MessageSquare, Package, User, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function Sidebar() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"post" | "service">("post");
  const [serviceTitle, setServiceTitle] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  
  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const menuItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Package, label: "Services", path: "/services" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Bookmark, label: "Bookings", path: "/bookings" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 20) {
      toast.error("Maximum 20 images allowed");
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedVideos.length + files.length > 10) {
      toast.error("Maximum 10 videos allowed");
      return;
    }
    setSelectedVideos([...selectedVideos, ...files]);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error("Please add content");
      return;
    }

    if (postType === "service" && (!serviceTitle || !servicePrice || !serviceCategory)) {
      toast.error("Please fill all service details");
      return;
    }

    setIsUploading(true);
    try {
      // Upload images and videos
      const uploadedImageUrls: string[] = [];
      const uploadedVideoUrls: string[] = [];

      // Upload images
      for (const image of selectedImages) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        const { storageId } = await result.json();
        uploadedImageUrls.push(storageId);
      }

      // Upload videos
      for (const video of selectedVideos) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": video.type },
          body: video,
        });
        const { storageId } = await result.json();
        uploadedVideoUrls.push(storageId);
      }

      await createPost({
        content: postContent,
        type: postType,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        videos: uploadedVideoUrls.length > 0 ? uploadedVideoUrls : undefined,
        serviceDetails: postType === "service" ? {
          title: serviceTitle,
          price: parseFloat(servicePrice),
          category: serviceCategory,
        } : undefined,
      });

      toast.success(postType === "service" ? "Service created!" : "Post created!");
      setCreateDialogOpen(false);
      setPostContent("");
      setServiceTitle("");
      setServicePrice("");
      setServiceCategory("");
      setSelectedImages([]);
      setSelectedVideos([]);
      setPostType("post");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 h-screen bg-white/50 backdrop-blur-sm border-r border-slate-200 p-4 flex flex-col"
      >
        <div className="mb-8 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">🧵</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900">A Silent Thread</h1>
              <p className="text-xs text-slate-600">Connected experiences</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-purple-100/50 rounded-xl text-slate-900"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: menuItems.length * 0.05 }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-emerald-100/50 rounded-xl text-slate-900 font-semibold"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Create Post</span>
            </Button>
          </motion.div>
        </nav>

        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="px-3 py-2 bg-white/50 rounded-xl">
            <p className="text-sm font-medium truncate text-slate-900">{user?.name || "User"}</p>
            <p className="text-xs text-slate-600 truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 hover:bg-red-50 rounded-xl text-red-500"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </motion.div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={postType === "post" ? "default" : "outline"}
                onClick={() => setPostType("post")}
                className="flex-1 rounded-xl"
              >
                Post
              </Button>
              <Button
                variant={postType === "service" ? "default" : "outline"}
                onClick={() => setPostType("service")}
                className="flex-1 rounded-xl"
              >
                Service/Listing
              </Button>
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>

            {postType === "service" && (
              <>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    placeholder="Service title"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      placeholder="e.g., Electronics"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Price per day ($)</Label>
                    <Input
                      type="number"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      placeholder="50"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label>Images (Max 20)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="rounded-xl"
              />
              {selectedImages.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedImages.length} image(s) selected
                </p>
              )}
            </div>

            <div>
              <Label>Videos (Max 10)</Label>
              <Input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoSelect}
                className="rounded-xl"
              />
              {selectedVideos.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedVideos.length} video(s) selected
                </p>
              )}
            </div>

            <Button
              onClick={handleCreatePost}
              disabled={isUploading}
              className="w-full rounded-xl"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}