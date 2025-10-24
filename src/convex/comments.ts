import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("comments", {
      postId: args.postId,
      userId: user._id,
      content: args.content,
      parentCommentId: args.parentCommentId,
      likes: [],
    });
  },
});

export const list = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("parentCommentId"), undefined))
      .order("desc")
      .collect();

    return await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        const replies = await ctx.db
          .query("comments")
          .withIndex("by_parent", (q) => q.eq("parentCommentId", comment._id))
          .collect();

        const repliesWithUsers = await Promise.all(
          replies.map(async (reply) => {
            const replyUser = await ctx.db.get(reply.userId);
            return { ...reply, user: replyUser };
          })
        );

        return { ...comment, user, replies: repliesWithUsers };
      })
    );
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== user._id) throw new Error("Not authorized");

    await ctx.db.delete(args.commentId);
  },
});

export const likeComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const likes = comment.likes || [];
    if (!likes.includes(user._id)) {
      await ctx.db.patch(args.commentId, { likes: [...likes, user._id] });
    }
  },
});

export const unlikeComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const likes = comment.likes || [];
    await ctx.db.patch(args.commentId, { likes: likes.filter(id => id !== user._id) });
  },
});