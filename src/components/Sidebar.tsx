import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Bell, Bookmark, Home, LogOut, MessageSquare, Package, User, Plus, Settings, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { UserSearch } from "@/components/UserSearch";
import { LoadingLogo } from "@/components/LoadingLogo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ============================================================================
// STATE AND CONFIGURATION
// ============================================================================

const MENU_ITEMS = [
  { icon: Home, label: "Feed", path: "/feed" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Bookmark, label: "Bookings", path: "/bookings" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

export function Sidebar() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  // ========================================================================
  // STATE: Sidebar Expand/Collapse
  // ========================================================================
  const [isCollapsed, setIsCollapsed] = useState(true);

  // ========================================================================
  // STATE: Dialogs
  // ========================================================================
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // ========================================================================
  // STATE: Post Creation Form
  // ========================================================================
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"post" | "service">("post");
  const [serviceTitle, setServiceTitle] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ========================================================================
  // MUTATIONS
  // ========================================================================
  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  // ========================================================================
  // HANDLERS: File Selection
  // ========================================================================
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

  // ========================================================================
  // HANDLERS: Post Creation
  // ========================================================================
  const handleCreatePost = async () => {
    // Validate content
    if (!postContent.trim()) {
      toast.error("Please add content");
      return;
    }

    // Validate service details if applicable
    if (postType === "service" && (!serviceTitle || !servicePrice || !serviceCategory)) {
      toast.error("Please fill all service details");
      return;
    }

    setIsUploading(true);
    try {
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

      // Create post with all data
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
      resetPostForm();
      setCreateDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  const resetPostForm = () => {
    setPostContent("");
    setServiceTitle("");
    setServicePrice("");
    setServiceCategory("");
    setSelectedImages([]);
    setSelectedVideos([]);
    setPostType("post");
  };

  // ========================================================================
  // RENDER: Main Sidebar Container
  // ========================================================================
  return (
    <>
      <TooltipProvider>
        <motion.div
          className="fixed left-0 top-0 z-50 h-screen bg-white/50 backdrop-blur-sm border-r border-slate-200 p-4 flex flex-col hidden md:flex"
          initial={{ width: 80 }}
          animate={{ width: isCollapsed ? 80 : 256 }}
          onMouseEnter={() => setIsCollapsed(false)}
          onMouseLeave={() => setIsCollapsed(true)}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* ================================================================
              HEADER: Logo
              ================================================================ */}
          <div className="mb-8 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">🧵</span>
              </div>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <h1 className="font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap">A Silent Thread</h1>
                    <p className="text-xs text-slate-600 whitespace-nowrap">Connected experiences</p>
                  </motion.div>
                )}
            </div>
          </div>

          {/* ================================================================
              NAVIGATION: Menu Items
              ================================================================ */}
          <nav className="flex-1 space-y-2">
            {MENU_ITEMS.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full gap-3 hover:bg-purple-100/50 rounded-xl text-black font-bold ${isCollapsed ? "justify-center" : "justify-start"}`}
                      onClick={() => navigate(item.path)}
                      title={item.label}
                    >
                      <item.icon className="h-5 w-5 text-black flex-shrink-0" strokeWidth={2.5} />
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden whitespace-nowrap font-bold text-black"
                      >
                        {item.label}
                      </motion.span>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="rounded-xl">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </motion.div>
            ))}

            {/* ============================================================
                ACTION: Create Post
                ============================================================ */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: (MENU_ITEMS.length + 1) * 0.05 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full gap-3 rounded-xl text-slate-900 font-semibold hover:bg-emerald-100/50 hover:shadow-sm active:scale-95 transition-all duration-150 ${isCollapsed ? "justify-center" : "justify-start"}`}
                    onClick={() => setCreateDialogOpen(true)}
                    title="Create Post"
                  >
                    <div className="h-5 w-5 bg-black rounded flex items-center justify-center flex-shrink-0">
                      <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        Create Post
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="rounded-xl">
                    Create Post
                  </TooltipContent>
                )}
              </Tooltip>
            </motion.div>
          </nav>

          {/* ================================================================
              FOOTER: User Info & Sign Out
              ================================================================ */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-slate-200 pt-4 space-y-2"
            >
              <motion.div
                className="px-3 py-2 bg-white/50 rounded-xl"
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-medium truncate text-slate-900">{user?.name || "User"}</p>
                <p className="text-xs text-slate-600 truncate">{user?.email}</p>
              </motion.div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-xl text-slate-900 hover:bg-transparent transition-all duration-150 active:scale-95"
                onClick={() => signOut()}
              >
                <motion.div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center bg-transparent hover:bg-gradient-to-br hover:from-red-200 hover:to-pink-200 transition-colors duration-200 flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogOut className="h-6 w-6 text-slate-900 hover:text-slate-700 transition-colors" strokeWidth={2.5} />
                </motion.div>
                <span className="text-sm font-medium whitespace-nowrap">Sign Out</span>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </TooltipProvider>

      {/* ==================================================================
          DIALOG: Create Post
          ================================================================== */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Post Type Selection */}
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

            {/* Content Input */}
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

            {/* Service-Specific Fields */}
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
                    <Label>Price per day (₹)</Label>
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

            {/* Image Upload */}
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

            {/* Video Upload */}
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

            {/* Submit Button */}
            <Button
              onClick={handleCreatePost}
              disabled={isUploading}
              className="w-full rounded-xl hover:bg-slate-100 active:scale-95 transition-all duration-150 disabled:opacity-70"
            >
              {isUploading ? (
                <LoadingLogo size="sm" variant="handshake" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================================================================
          DIALOG: User Search
          ================================================================== */}
      <UserSearch open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
    </>
  );
}