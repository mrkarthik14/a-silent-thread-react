import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const sharePost = mutation({
  args: {
    postId: v.id("posts"),
    recipientId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const messageId = await ctx.db.insert("messages", {
      senderId: user._id,
      recipientId: args.recipientId,
      content: args.message || `Shared a post`,
      read: false,
      messageType: "sharedPost",
      mediaUrl: post.images?.[0] || post.image,
    });

    await ctx.db.insert("sharedPosts", {
      postId: args.postId,
      userId: user._id,
      message: args.message,
    });

    return { success: true };
  },
});

export const getSharedPosts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const shared = await ctx.db
      .query("sharedPosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      shared.map(async (share) => {
        const post = await ctx.db.get(share.postId);
        const postUser = post ? await ctx.db.get(post.userId) : null;
        return { ...share, post: post ? { ...post, user: postUser } : null };
      })
    );
  },
});
