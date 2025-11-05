import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const send = mutation({
  args: {
    recipientId: v.id("users"),
    content: v.string(),
    messageType: v.optional(v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
      v.literal("file"),
      v.literal("gif"),
      v.literal("voice")
    )),
    mediaUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    fileType: v.optional(v.string()),
    parentMessageId: v.optional(v.id("messages")),
    voiceDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("messages", {
      senderId: user._id,
      recipientId: args.recipientId,
      content: args.content,
      read: false,
      messageType: args.messageType,
      mediaUrl: args.mediaUrl,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      parentMessageId: args.parentMessageId,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const storeFileAndGetUrl = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId as any);
    return url;
  },
});

export const getConversation = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", user._id))
      .filter((q) => q.eq(q.field("recipientId"), args.userId))
      .order("desc")
      .collect();

    const messagesWithOtherUser = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .filter((q) => q.eq(q.field("senderId"), args.userId))
      .order("desc")
      .collect();

    const allMessages = [...messages, ...messagesWithOtherUser].sort(
      (a, b) => b._creationTime - a._creationTime
    );

    return allMessages;
  },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const messages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.or(
          q.eq(q.field("senderId"), user._id),
          q.eq(q.field("recipientId"), user._id)
        )
      )
      .order("desc")
      .collect();

    const conversationMap = new Map();
    
    for (const message of messages) {
      const otherUserId = message.senderId === user._id ? message.recipientId : message.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        const otherUser = await ctx.db.get(otherUserId);
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        });
      }
      
      if (message.recipientId === user._id && !message.read) {
        const conv = conversationMap.get(otherUserId);
        conv.unreadCount++;
      }
    }

    return Array.from(conversationMap.values());
  },
});

export const markAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", args.userId))
      .collect();

    const unreadMessages = messages.filter(
      (msg) => msg.recipientId === user._id && !msg.read
    );

    await Promise.all(
      unreadMessages.map((message) =>
        ctx.db.patch(message._id, { read: true })
      )
    );
  },
});

export const markMessageAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.recipientId === user._id && !message.read) {
      await ctx.db.patch(args.messageId, { read: true });
    }
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

export const hideMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.recipientId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.messageId, { isHidden: true });
  },
});

export const likeMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const likes = message.likes || [];
    if (!likes.includes(user._id)) {
      await ctx.db.patch(args.messageId, { likes: [...likes, user._id] });
    }
  },
});

export const unlikeMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const likes = message.likes || [];
    await ctx.db.patch(args.messageId, { likes: likes.filter(id => id !== user._id) });
  },
});

export const addReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const reactions = message.reactions || [];
    const existingReaction = reactions.find(r => r.emoji === args.emoji);
    
    if (existingReaction) {
      if (!existingReaction.userIds.includes(user._id)) {
        existingReaction.userIds.push(user._id);
        await ctx.db.patch(args.messageId, { reactions });
      }
    } else {
      reactions.push({ emoji: args.emoji, userIds: [user._id] });
      await ctx.db.patch(args.messageId, { reactions });
    }
  },
});

export const removeReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const reactions = message.reactions || [];
    const reactionIndex = reactions.findIndex(r => r.emoji === args.emoji);
    
    if (reactionIndex !== -1) {
      reactions[reactionIndex].userIds = reactions[reactionIndex].userIds.filter(id => id !== user._id);
      if (reactions[reactionIndex].userIds.length === 0) {
        reactions.splice(reactionIndex, 1);
      }
      await ctx.db.patch(args.messageId, { reactions });
    }
  },
});

export const pinMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.recipientId !== user._id && message.senderId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.messageId, { isPinned: true });
  },
});

export const unpinMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.recipientId !== user._id && message.senderId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.messageId, { isPinned: false });
  },
});

export const addToFavorite = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const favorites = message.isFavorite || [];
    if (!favorites.includes(user._id)) {
      await ctx.db.patch(args.messageId, { isFavorite: [...favorites, user._id] });
    }
  },
});

export const removeFromFavorite = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const favorites = message.isFavorite || [];
    await ctx.db.patch(args.messageId, { isFavorite: favorites.filter(id => id !== user._id) });
  },
});

export const deleteConversation = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const messages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("senderId"), user._id),
            q.eq(q.field("recipientId"), args.userId)
          ),
          q.and(
            q.eq(q.field("senderId"), args.userId),
            q.eq(q.field("recipientId"), user._id)
          )
        )
      )
      .collect();

    await Promise.all(messages.map(msg => ctx.db.delete(msg._id)));
  },
});

export const getSharedPostDetails = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.messageType !== "sharedPost") return null;

    const sharedPost = await ctx.db
      .query("sharedPosts")
      .withIndex("by_post", (q) => q.eq("postId", message._id as any))
      .first();
    
    if (!sharedPost) return null;

    const post = await ctx.db.get(sharedPost.postId);
    if (!post) return null;

    const postUser = await ctx.db.get(post.userId);
    return { ...post, user: postUser };
  },
});

export const notifyNewMessage = mutation({
  args: { recipientId: v.id("users"), senderId: v.id("users") },
  handler: async (ctx, args) => {
    const sender = await ctx.db.get(args.senderId);
    if (!sender) return;

    await ctx.db.insert("notifications", {
      userId: args.recipientId,
      type: "message",
      content: `New message from ${sender.name || "Someone"}`,
      read: false,
      relatedId: args.senderId.toString(),
    });
  },
});