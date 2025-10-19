import { v } from "convex/values";
import { query } from "./_generated/server";

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length === 0) {
      return [];
    }

    const allUsers = await ctx.db.query("users").collect();
    
    const searchTerm = args.query.toLowerCase();
    const filtered = allUsers.filter((user) => {
      const name = user.name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      return name.includes(searchTerm) || email.includes(searchTerm);
    });

    return filtered.slice(0, 20);
  },
});
