import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const setTyping = mutation({
  args: {
    recipientId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Find existing typing indicator
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_sender_and_recipient", (q) =>
        q.eq("senderId", user._id).eq("recipientId", args.recipientId)
      )
      .unique();

    if (args.isTyping) {
      if (existing) {
        // Update timestamp
        await ctx.db.patch(existing._id, {
          timestamp: Date.now(),
        });
      } else {
        // Create new indicator
        await ctx.db.insert("typingIndicators", {
          senderId: user._id,
          recipientId: args.recipientId,
          timestamp: Date.now(),
        });
      }
    } else {
      // Remove indicator if it exists
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }
  },
});

export const getTypingStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    const indicator = await ctx.db
      .query("typingIndicators")
      .withIndex("by_sender_and_recipient", (q) =>
        q.eq("senderId", args.userId).eq("recipientId", user._id)
      )
      .unique();

    if (!indicator) return false;

    // Check if indicator is stale (older than 5 seconds)
    const isStale = Date.now() - indicator.timestamp > 5000;
    return !isStale;
  },
});

export const clearTyping = mutation({
  args: { recipientId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_sender_and_recipient", (q) =>
        q.eq("senderId", user._id).eq("recipientId", args.recipientId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
