import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function Services() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  
  const posts = useQuery(api.posts.list, {});
  const services = posts?.filter(p => p.type === "service");
  const createPost = useMutation(api.posts.create);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleCreate = async () => {
    if (!title || !description || !price || !category) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await createPost({
        content: description,
        type: "service",
        serviceDetails: {
          title,
          price: parseFloat(price),
          category,
        },
      });
      toast.success("Service created!");
      setOpen(false);
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
    } catch (error) {
      toast.error("Failed to create service");
    }
  };

  const colors = ["bg-green-50", "bg-blue-50", "bg-yellow-50", "bg-pink-50", "bg-purple-50"];

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Services</h1>
              <p className="text-muted-foreground">Discover and rent amazing things</p>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  List Service
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Camera Equipment"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Electronics"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Price per day ($)</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="50"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your service..."
                      className="rounded-xl"
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full rounded-xl">
                    Create Service
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <div className="grid gap-4">
            {services?.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard
                  post={service}
                  color={colors[index % colors.length]}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
