import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const getSuggestedUsers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    // Get users that current user is already following
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();
    
    const followingIds = new Set(following.map(f => f.followingId));

    // Filter for only active/online users not already following
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const suggested = allUsers.filter(u => 
      u._id !== user._id && 
      !followingIds.has(u._id) &&
      u.lastSeen && 
      u.lastSeen > fiveMinutesAgo
    );

    // Sort by last seen (most recently active first)
    suggested.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));

    return suggested.slice(0, 10);
  },
});