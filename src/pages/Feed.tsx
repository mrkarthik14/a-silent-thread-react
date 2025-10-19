import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { ThreadLine } from "@/components/ThreadLine";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Search, Plus, Bell, User } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Feed() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const posts = useQuery(api.posts.list, {});
  const likePost = useMutation(api.posts.like);
  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"post" | "service">("post");
  const [serviceTitle, setServiceTitle] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);

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
    "bg-gradient-to-br from-blue-100 to-blue-200"
  ];

  const getColorForIndex = (index: number) => {
    const colorIndex = index % colors.length;
    if (index > 0 && colorIndex === ((index - 1) % colors.length)) {
      return colors[(colorIndex + 1) % colors.length];
    }
    return colors[colorIndex];
  };

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
      const uploadedImageUrls: string[] = [];
      const uploadedVideoUrls: string[] = [];

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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-900" strokeWidth={1.5} />
              <Input
                placeholder="Search threads..."
                className="pl-10 rounded-xl border-slate-200 bg-white"
              />
            </div>
          </motion.div>

          <div className="space-y-4">
            {posts?.map((post, index) => (
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
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
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
    </div>
  );
}