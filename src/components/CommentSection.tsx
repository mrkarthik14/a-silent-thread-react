import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Trash2, Edit2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CommentSectionProps {
  postId: Id<"posts">;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<Id<"comments"> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"comments"> | null>(null);
  const { user } = useAuth();

  const comments = useQuery(api.comments.list, { postId });
  const commentCount = useQuery(api.comments.getCommentCount, { postId });
  const createComment = useMutation(api.comments.create);
  const deleteComment = useMutation(api.comments.deleteComment);
  const updateComment = useMutation(api.comments.updateComment);
  const [editingId, setEditingId] = useState<Id<"comments"> | null>(null);
  const [editContent, setEditContent] = useState("");

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

  const handleDeleteConfirm = async (commentId: Id<"comments">) => {
    try {
      await deleteComment({ commentId });
      toast.success("Comment deleted");
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const handleEditStart = (comment: any) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleEditSave = async (commentId: Id<"comments">) => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    try {
      await updateComment({ commentId, content: editContent });
      setEditingId(null);
      setEditContent("");
      toast.success("Comment updated");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </p>
      </div>
      <div className="flex gap-2">
        <Textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          className="rounded-xl resize-none bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-500"
          rows={2}
        />
        <Button
          onClick={handleSubmit}
          disabled={!commentContent.trim()}
          className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      {replyTo && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/30 rounded-lg px-3 py-2 border border-slate-700"
        >
          <span>Replying to comment</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReplyTo(null)}
            className="h-6 px-2 text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Button>
        </motion.div>
      )}

      <div className="space-y-3">
        {comments?.map((comment) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 border-2 border-slate-700 flex-shrink-0">
                <AvatarImage src={comment.user?.image} alt={comment.user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs font-bold">
                  {comment.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-slate-100">
                    {comment.user?.name || "Anonymous"}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyTo(comment._id)}
                      className="h-6 px-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                    {comment.userId === user?._id && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditStart(comment)}
                          className="h-6 px-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                        >
                          <Edit2 className="h-3 w-3" strokeWidth={1.5} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmId(comment._id)}
                          className="h-6 px-2 text-red-500 hover:text-red-400 hover:bg-slate-800"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {editingId === comment._id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="rounded-lg resize-none text-sm bg-slate-800 border-slate-700 text-slate-100"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(comment._id)}
                        className="h-6 px-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        <Check className="h-3 w-3" strokeWidth={1.5} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditCancel}
                        className="h-6 px-2 text-slate-400 hover:text-slate-200"
                      >
                        <X className="h-3 w-3" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300 mt-1">{comment.content}</p>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 ml-4 space-y-2 border-l-2 border-slate-700 pl-3"
                  >
                    {comment.replies.map((reply) => (
                      <motion.div 
                        key={reply._id} 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2"
                      >
                        <Avatar className="h-6 w-6 border border-slate-700 flex-shrink-0">
                          <AvatarImage src={reply.user?.image} alt={reply.user?.name} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs font-bold">
                            {reply.user?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-xs text-slate-200">
                            {reply.user?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-slate-400">{reply.content}</p>
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

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteConfirm(deleteConfirmId)}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}