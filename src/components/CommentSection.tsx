import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Trash2, Reply, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";

interface CommentSectionProps {
  postId: Id<"posts">;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<Id<"comments"> | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "liked">("newest");
  const { user } = useAuth();

  const comments = useQuery(api.comments.list, { postId });
  const createComment = useMutation(api.comments.create);
  const deleteComment = useMutation(api.comments.deleteComment);

  const handleSubmit = async () => {
    if (!commentContent.trim()) return;

    try {
      await createComment({
        postId,
        content: commentContent,
        parentCommentId: replyTo || undefined,
      });
      setCommentContent("");
      setReplyTo(null);
      toast.success(replyTo ? "Reply added" : "Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleDelete = async (commentId: Id<"comments">) => {
    try {
      await deleteComment({ commentId });
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const sortedComments = comments ? [...comments].sort((a, b) => {
    if (sortBy === "newest") {
      return b._creationTime - a._creationTime;
    } else if (sortBy === "oldest") {
      return a._creationTime - b._creationTime;
    } else if (sortBy === "liked") {
      const aLikes = a.likes?.length || 0;
      const bLikes = b.likes?.length || 0;
      return bLikes - aLikes;
    }
    return 0;
  }) : [];

  return (
    <div className="space-y-4 mt-4">
      {/* Reply Context Banner */}
      {replyTo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-3 border-l-4 border-blue-400 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Reply className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Replying to a comment
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReplyTo(null)}
            className="h-6 px-2 text-blue-600 hover:bg-blue-200"
          >
            Cancel
          </Button>
        </motion.div>
      )}

      {/* Comment Input */}
      <div className="flex gap-2">
        <Textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          className="rounded-xl resize-none"
          rows={2}
        />
        <Button
          onClick={handleSubmit}
          disabled={!commentContent.trim()}
          className="rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      {/* Sort Options */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 items-center flex-wrap"
      >
        <span className="text-xs font-semibold text-slate-600">Sort by:</span>
        <Button
          size="sm"
          variant={sortBy === "newest" ? "default" : "outline"}
          onClick={() => setSortBy("newest")}
          className={`rounded-lg text-xs ${
            sortBy === "newest"
              ? "bg-gradient-to-r from-purple-300 to-blue-300 text-slate-900 border-none"
              : "border-slate-200 hover:bg-slate-100"
          }`}
        >
          Newest
        </Button>
        <Button
          size="sm"
          variant={sortBy === "oldest" ? "default" : "outline"}
          onClick={() => setSortBy("oldest")}
          className={`rounded-lg text-xs ${
            sortBy === "oldest"
              ? "bg-gradient-to-r from-purple-300 to-blue-300 text-slate-900 border-none"
              : "border-slate-200 hover:bg-slate-100"
          }`}
        >
          Oldest
        </Button>
        <Button
          size="sm"
          variant={sortBy === "liked" ? "default" : "outline"}
          onClick={() => setSortBy("liked")}
          className={`rounded-lg text-xs flex items-center gap-1 ${
            sortBy === "liked"
              ? "bg-gradient-to-r from-purple-300 to-blue-300 text-slate-900 border-none"
              : "border-slate-200 hover:bg-slate-100"
          }`}
        >
          <ArrowUp className="h-3 w-3" />
          Most Liked
        </Button>
      </motion.div>

      {/* Comments List */}
      <div className="space-y-3">
        {sortedComments?.map((comment) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/50 rounded-xl p-3"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={comment.user?.image} />
                <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300">
                  {comment.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-slate-900">
                    {comment.user?.name || "Anonymous"}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyTo(comment._id)}
                      className="h-6 px-2 hover:bg-purple-100"
                    >
                      <Reply className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                    {comment.userId === user?._id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(comment._id)}
                        className="h-6 px-2 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-800 mt-1">{comment.content}</p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 ml-4 space-y-2 border-l-2 border-purple-200 pl-3"
                  >
                    {comment.replies.map((reply) => (
                      <motion.div
                        key={reply._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2"
                      >
                        <Avatar className="h-6 w-6 border border-white">
                          <AvatarImage src={reply.user?.image} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-300 to-purple-300 text-xs">
                            {reply.user?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-xs text-slate-900">
                              {reply.user?.name || "Anonymous"}
                            </p>
                            {reply.userId === user?._id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(reply._id)}
                                className="h-5 px-1 text-red-500 hover:bg-red-100"
                              >
                                <Trash2 className="h-2.5 w-2.5" strokeWidth={2} />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 mt-0.5">
                            {reply.content}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}