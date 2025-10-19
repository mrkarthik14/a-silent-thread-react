import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const send = mutation({
  args: {
    recipientId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("messages", {
      senderId: user._id,
      recipientId: args.recipientId,
      content: args.content,
      read: false,
    });
  },
});

export const getConversation = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get messages sent by current user to the other user
    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", user._id))
      .filter((q) => q.eq(q.field("recipientId"), args.userId))
      .order("desc")
      .collect();

    // Get messages sent by the other user to current user
    const receivedMessages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .filter((q) => q.eq(q.field("senderId"), args.userId))
      .order("desc")
      .collect();

    // Combine and sort by creation time
    const allMessages = [...sentMessages, ...receivedMessages];
    allMessages.sort((a, b) => b._creationTime - a._creationTime);

    return allMessages;
  },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get all messages where user is sender
    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", user._id))
      .order("desc")
      .collect();

    // Get all messages where user is recipient
    const receivedMessages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .collect();

    const allMessages = [...sentMessages, ...receivedMessages];
    allMessages.sort((a, b) => b._creationTime - a._creationTime);

    const conversationMap = new Map();
    
    for (const message of allMessages) {
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
        if (conv) {
          conv.unreadCount++;
        }
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
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("senderId"), args.userId),
          q.eq(q.field("read"), false)
        )
      )
      .collect();

    await Promise.all(
      messages.map((message) =>
        ctx.db.patch(message._id, { read: true })
      )
    );
  },
});