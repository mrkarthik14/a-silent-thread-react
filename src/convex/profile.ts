import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.interests !== undefined) updates.interests = args.interests;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.image !== undefined) updates.image = args.image;

    await ctx.db.patch(user._id, updates);
    return await ctx.db.get(user._id);
  },
});