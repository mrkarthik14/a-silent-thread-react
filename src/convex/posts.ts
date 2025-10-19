import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    videos: v.optional(v.array(v.string())),
    type: v.union(v.literal("post"), v.literal("service")),
    serviceDetails: v.optional(v.object({
      title: v.string(),
      price: v.number(),
      category: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("posts", {
      userId: user._id,
      content: args.content,
      image: args.image,
      images: args.images,
      videos: args.videos,
      type: args.type,
      serviceDetails: args.serviceDetails,
      likes: 0,
      replies: 0,
    });
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .take(args.limit || 50);

    return await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return { ...post, user };
      })
    );
  },
});

export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;
    
    const user = await ctx.db.get(post.userId);
    return { ...post, user };
  },
});

export const reply = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    await ctx.db.patch(args.postId, {
      replies: post.replies + 1,
    });

    return await ctx.db.insert("posts", {
      userId: user._id,
      content: args.content,
      type: "post" as const,
      parentId: args.postId,
      likes: 0,
      replies: 0,
    });
  },
});

export const like = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    await ctx.db.patch(args.postId, {
      likes: post.likes + 1,
    });
  },
});

export const getReplies = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const replies = await ctx.db
      .query("posts")
      .withIndex("by_parent", (q) => q.eq("parentId", args.postId))
      .collect();

    return await Promise.all(
      replies.map(async (reply) => {
        const user = await ctx.db.get(reply.userId);
        return { ...reply, user };
      })
    );
  },
});