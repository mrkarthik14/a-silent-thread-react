import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const initiateCall = mutation({
  args: {
    recipientId: v.id("users"),
    callType: v.union(v.literal("voice"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("calls", {
      initiatorId: user._id,
      recipientId: args.recipientId,
      callType: args.callType,
      status: "ringing",
      startTime: Date.now(),
    });
  },
});

export const acceptCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");

    await ctx.db.patch(args.callId, { status: "active" });
  },
});

export const rejectCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");

    await ctx.db.patch(args.callId, { status: "rejected" });
  },
});

export const endCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");

    await ctx.db.patch(args.callId, {
      status: "ended",
      endTime: Date.now(),
    });
  },
});

export const getActiveCall = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const activeCall = await ctx.db
      .query("calls")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("initiatorId"), args.userId),
            q.eq(q.field("recipientId"), args.userId)
          ),
          q.eq(q.field("status"), "active")
        )
      )
      .first();

    return activeCall || null;
  },
});

export const getIncomingCall = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const incomingCall = await ctx.db
      .query("calls")
      .filter((q) =>
        q.and(
          q.eq(q.field("recipientId"), user._id),
          q.eq(q.field("status"), "ringing")
        )
      )
      .first();

    return incomingCall || null;
  },
});

export const getCallHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const calls = await ctx.db
      .query("calls")
      .filter((q) =>
        q.or(
          q.eq(q.field("initiatorId"), user._id),
          q.eq(q.field("recipientId"), user._id)
        )
      )
      .order("desc")
      .collect();

    return calls;
  },
});
