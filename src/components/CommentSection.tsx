import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Trash2 } from "lucide-react";
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
      toast.success("Comment added");
    } catch (error) {
      console.error("Comment error:", error);
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

  return (
    <div className="space-y-4 mt-4">
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
          className="rounded-xl"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      {replyTo && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Replying to comment</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReplyTo(null)}
            className="h-6 px-2"
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {comments?.map((comment) => (
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
                      className="h-6 px-2"
                    >
                      <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                    {comment.userId === user?._id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(comment._id)}
                        className="h-6 px-2 text-red-500"
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-800 mt-1">{comment.content}</p>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 ml-4 space-y-2 border-l-2 border-purple-200 pl-3">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 border border-white">
                          <AvatarImage src={reply.user?.image} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-300 to-purple-300 text-xs">
                            {reply.user?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-xs text-slate-900">
                            {reply.user?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-slate-800">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
