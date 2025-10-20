import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const postUser = await ctx.db.get(post.userId);
        return { ...post, user: postUser };
      })
    );

    return {
      ...user,
      posts: enrichedPosts,
    };
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const postUser = await ctx.db.get(post.userId);
        return { ...post, user: postUser };
      })
    );

    return {
      ...user,
      posts: enrichedPosts,
    };
  },
});
