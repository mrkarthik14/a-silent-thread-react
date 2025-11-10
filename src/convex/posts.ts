import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

const parseMentions = (content: string) => {
  const mentions: Array<{ type: "user" | "post"; id: string; name: string }> = [];
  const mentionRegex = /&([a-zA-Z0-9_-]+)/g;
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      type: "user",
      id: match[1],
      name: match[1],
    });
  }
  
  return mentions;
};

export const create = mutation({
  args: {
    content: v.string(),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    imageCaptions: v.optional(v.array(v.string())),
    videos: v.optional(v.array(v.string())),
    imageLayout: v.optional(v.union(v.literal("slider"), v.literal("grid"), v.literal("bounce"))),
    imageDimensions: v.optional(v.array(v.object({
      width: v.number(),
      height: v.number(),
    }))),
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

    const mentions = parseMentions(args.content);

    return await ctx.db.insert("posts", {
      userId: user._id,
      content: args.content,
      image: args.image,
      images: args.images,
      imageCaptions: args.imageCaptions,
      videos: args.videos,
      imageLayout: args.imageLayout,
      imageDimensions: args.imageDimensions,
      type: args.type,
      serviceDetails: args.serviceDetails,
      likes: 0,
      replies: 0,
      shares: 0,
      mentions: mentions.length > 0 ? mentions : undefined,
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

export const listPaginated = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("posts")
      .order("desc")
      .paginate(args.paginationOpts);

    const postsWithUsers = await Promise.all(
      result.page.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return { ...post, user };
      })
    );

    return {
      page: postsWithUsers,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const listByFollowing = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { page: [], isDone: true, continueCursor: null };

    // Get users that current user is following
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const followingIds = follows.map((f) => f.followingId);

    // Get posts from following users
    const result = await ctx.db
      .query("posts")
      .filter((q) => q.or(...followingIds.map((id) => q.eq(q.field("userId"), id))))
      .order("desc")
      .paginate(args.paginationOpts);

    const postsWithUsers = await Promise.all(
      result.page.map(async (post) => {
        const postUser = await ctx.db.get(post.userId);
        return { ...post, user: postUser };
      })
    );

    return {
      page: postsWithUsers,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const listUserListings = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { page: [], isDone: true, continueCursor: null };

    const result = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("type"), "service"))
      .order("desc")
      .paginate(args.paginationOpts);

    const postsWithUsers = await Promise.all(
      result.page.map(async (post) => {
        const postUser = await ctx.db.get(post.userId);
        return { ...post, user: postUser };
      })
    );

    return {
      page: postsWithUsers,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
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
      shares: 0,
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

    // Check if user has already liked this post
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) => 
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    if (existingLike) {
      // Unlike: remove the like record and decrement count
      await ctx.db.delete(existingLike._id);
      const currentPost = await ctx.db.get(args.postId);
      await ctx.db.patch(args.postId, {
        likes: Math.max(0, (currentPost?.likes ?? 0) - 1),
      });
      return { liked: false };
    } else {
      // Like: create like record and increment count
      await ctx.db.insert("likes", {
        userId: user._id,
        postId: args.postId,
      });
      const currentPost = await ctx.db.get(args.postId);
      await ctx.db.patch(args.postId, {
        likes: (currentPost?.likes ?? 0) + 1,
      });
      return { liked: true };
    }
  },
});

export const hasUserLiked = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) => 
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    return !!like;
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

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.userId !== user._id) throw new Error("Unauthorized");

    // Delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete the post
    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    serviceDetails: v.optional(v.object({
      title: v.string(),
      price: v.number(),
      category: v.string(),
      location: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.postId, {
      content: args.content,
      serviceDetails: args.serviceDetails,
    });
    return { success: true };
  },
});

export const hidePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("hiddenPosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const alreadyHidden = existing.some((h) => h.postId === args.postId);
    if (alreadyHidden) return { success: true };

    await ctx.db.insert("hiddenPosts", {
      userId: user._id,
      postId: args.postId,
    });
    return { success: true };
  },
});

export const notifyLike = mutation({
  args: { postId: v.id("posts"), likerId: v.id("users") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;

    const liker = await ctx.db.get(args.likerId);
    if (!liker) return;

    await ctx.db.insert("notifications", {
      userId: post.userId,
      type: "like",
      content: `${liker.name || "Someone"} liked your post`,
      read: false,
      relatedId: args.postId.toString(),
    });
  },
});

export const notifyComment = mutation({
  args: { postId: v.id("posts"), commenterId: v.id("users") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;

    const commenter = await ctx.db.get(args.commenterId);
    if (!commenter) return;

    await ctx.db.insert("notifications", {
      userId: post.userId,
      type: "comment",
      content: `${commenter.name || "Someone"} commented on your post`,
      read: false,
      relatedId: args.postId.toString(),
    });
  },
});

export const notifyShare = mutation({
  args: { postId: v.id("posts"), sharerId: v.id("users") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;

    const sharer = await ctx.db.get(args.sharerId);
    if (!sharer) return;

    await ctx.db.insert("notifications", {
      userId: post.userId,
      type: "share",
      content: `${sharer.name || "Someone"} shared your post`,
      read: false,
      relatedId: args.postId.toString(),
    });
  },
});

export const notifyMention = mutation({
  args: { postId: v.id("posts"), mentionedUserId: v.id("users"), mentionerId: v.id("users") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;

    const mentioner = await ctx.db.get(args.mentionerId);
    if (!mentioner) return;

    await ctx.db.insert("notifications", {
      userId: args.mentionedUserId,
      type: "mention",
      content: `${mentioner.name || "Someone"} mentioned you in a post`,
      read: false,
      relatedId: args.postId.toString(),
    });
  },
});