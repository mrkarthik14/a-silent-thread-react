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
      v.literal("gif")
    )),
    mediaUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    fileType: v.optional(v.string()),
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
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getConversation = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

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
      .order("desc")
      .collect();

    return messages;
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