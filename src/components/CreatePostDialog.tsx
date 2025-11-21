import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon, Video, X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"post" | "service">("post");
  const [serviceTitle, setServiceTitle] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLayout, setImageLayout] = useState<"slider" | "grid" | "bounce" | null>(null);
  const [imageCaptions, setImageCaptions] = useState<string[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 20) {
      toast.error("Maximum 20 images allowed");
      return;
    }
    
    setSelectedImages([...selectedImages, ...files]);
    const newCaptions = [...imageCaptions];
    files.forEach(() => newCaptions.push(""));
    setImageCaptions(newCaptions);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedVideos.length + files.length > 10) {
      toast.error("Maximum 10 videos allowed");
      return;
    }
    setSelectedVideos([...selectedVideos, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageCaptions(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
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

    if (selectedImages.length > 1 && !imageLayout) {
      toast.error("Please select a layout style for multiple images");
      return;
    }

    setIsUploading(true);
    try {
      // Upload images
      const imageUploadPromises = selectedImages.map(async (image) => {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        const { storageId } = await result.json();
        return storageId;
      });
      const uploadedImageUrls = await Promise.all(imageUploadPromises);

      // Upload videos
      const videoUploadPromises = selectedVideos.map(async (video) => {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": video.type },
          body: video,
        });
        const { storageId } = await result.json();
        return storageId;
      });
      const uploadedVideoUrls = await Promise.all(videoUploadPromises);

      await createPost({
        content: postContent,
        type: postType,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        imageCaptions: imageCaptions.filter(c => c.trim()).length > 0 ? imageCaptions : undefined,
        videos: uploadedVideoUrls.length > 0 ? uploadedVideoUrls : undefined,
        imageLayout: imageLayout && ["slider", "grid", "bounce"].includes(imageLayout) ? imageLayout : undefined,
        serviceDetails: postType === "service" ? {
          title: serviceTitle,
          price: parseFloat(servicePrice),
          category: serviceCategory,
        } : undefined,
      });

      toast.success(postType === "service" ? "Service created!" : "Post created!");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Post creation error:", error);
      toast.error("Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setPostContent("");
    setServiceTitle("");
    setServicePrice("");
    setServiceCategory("");
    setSelectedImages([]);
    setSelectedVideos([]);
    setPostType("post");
    setImageLayout(null);
    setImageCaptions([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white dark:bg-[#1a1a20] border-slate-200 dark:border-white/10">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-white/5">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Create New</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <Tabs value={postType} onValueChange={(v) => setPostType(v as "post" | "service")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="post">Regular Post</TabsTrigger>
                <TabsTrigger value="service">Service / Listing</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[120px] resize-none bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
              />
            </div>

            {postType === "service" && (
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <div className="space-y-2">
                  <Label>Service Title</Label>
                  <Input 
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    placeholder="e.g., Professional Photography"
                    className="bg-white dark:bg-white/5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input 
                      type="number"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      placeholder="0.00"
                      className="bg-white dark:bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input 
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      placeholder="e.g., Photography"
                      className="bg-white dark:bg-white/5"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1 gap-2"
                  disabled={selectedImages.length >= 20}
                >
                  <ImageIcon className="h-4 w-4" />
                  Add Images ({selectedImages.length}/20)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex-1 gap-2"
                  disabled={selectedVideos.length >= 10}
                >
                  <Video className="h-4 w-4" />
                  Add Videos ({selectedVideos.length}/10)
                </Button>
                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  multiple
                  onChange={handleVideoSelect}
                />
              </div>

              {selectedImages.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {selectedImages.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {selectedImages.length > 1 && (
                    <div className="space-y-2">
                      <Label>Image Layout</Label>
                      <div className="flex gap-2">
                        {["slider", "grid", "bounce"].map((layout) => (
                          <Button
                            key={layout}
                            type="button"
                            variant={imageLayout === layout ? "default" : "outline"}
                            onClick={() => setImageLayout(layout as any)}
                            className="flex-1 capitalize"
                          >
                            {layout}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedVideos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedVideos.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group bg-black">
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeVideo(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-2 bg-slate-50/50 dark:bg-white/5">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreatePost} disabled={isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {postType === "service" ? "Create Listing" : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
