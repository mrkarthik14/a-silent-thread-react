import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Update user's last seen timestamp
export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return;

    await ctx.db.patch(user._id, {
      lastSeen: Date.now(),
    });
  },
});

// Get online status for a specific user
export const getUserPresence = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.lastSeen) return { isOnline: false };

    // Consider user online if they were active in the last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return { isOnline: user.lastSeen > fiveMinutesAgo };
  },
});

// Get online status for multiple users
export const getBulkPresence = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const presenceMap: Record<string, boolean> = {};

    for (const userId of args.userIds) {
      const user = await ctx.db.get(userId);
      presenceMap[userId] = user?.lastSeen ? user.lastSeen > fiveMinutesAgo : false;
    }

    return presenceMap;
  },
});
