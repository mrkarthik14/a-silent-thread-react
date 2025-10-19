import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Calendar, Search, Sparkles, Plus, Bell, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <nav className="px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-white text-2xl">🧵</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">A Silent Thread</span>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Create Post Button */}
                <Button
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1" strokeWidth={1.5} />
                  Create
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl hover:bg-purple-100/50"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell className="h-5 w-5 text-slate-900" strokeWidth={1.5} />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    3
                  </Badge>
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={user?.image} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                          {user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user?.name || "User"}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/feed")} className="cursor-pointer">
                      Go to Feed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 shadow-sm"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-white text-5xl">🧵</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            A Silent Thread
          </h1>
          
          <p className="text-xl text-slate-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            Where connections flow like gentle threads
          </p>
          
          <p className="text-base text-slate-500 mb-10 max-w-2xl mx-auto">
            A modern renting platform that visualizes your connections, services, and conversations as beautiful, flowing threads. Experience community in a whole new way.
          </p>
          
          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/feed" : "/auth")}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 py-6 text-lg shadow-lg"
          >
            {isAuthenticated ? "Go to Feed" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: MessageCircle,
              title: "Thread Connections",
              description: "Connect with others through beautiful, flowing conversations",
              color: "from-pink-200 to-pink-300",
              textColor: "text-pink-900"
            },
            {
              icon: Search,
              title: "Discover Services",
              description: "Find and offer services in your community",
              color: "from-yellow-200 to-yellow-300",
              textColor: "text-yellow-900"
            },
            {
              icon: Calendar,
              title: "Easy Bookings",
              description: "Seamless booking experience with visual connections",
              color: "from-emerald-200 to-emerald-300",
              textColor: "text-emerald-900"
            },
            {
              icon: Sparkles,
              title: "Beautiful Design",
              description: "Soft, minimal interface that feels alive",
              color: "from-purple-200 to-purple-300",
              textColor: "text-purple-900"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className={`bg-gradient-to-br ${feature.color} rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="mb-4">
                <feature.icon className={`h-10 w-10 ${feature.textColor}`} strokeWidth={1.5} />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${feature.textColor}`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${feature.textColor} opacity-80`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
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