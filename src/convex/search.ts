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

export const globalSearch = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length === 0) {
      return { users: [], posts: [], listings: [] };
    }

    const searchTerm = args.query.toLowerCase();
    const users: any[] = [];
    const posts: any[] = [];
    const listings: any[] = [];

    // Search users
    if (!args.type || args.type === "users") {
      const allUsers = await ctx.db.query("users").collect();
      const filtered = allUsers
        .filter((user) => {
          const name = user.name?.toLowerCase() || "";
          const email = user.email?.toLowerCase() || "";
          return name.includes(searchTerm) || email.includes(searchTerm);
        })
        .slice(0, 10);
      users.push(...filtered);
    }

    // Search posts and listings
    if (!args.type || args.type === "posts" || args.type === "listings") {
      const allPosts = await ctx.db.query("posts").collect();
      const filtered = allPosts.filter((post) => {
        const content = post.content.toLowerCase();
        const title = post.serviceDetails?.title?.toLowerCase() || "";
        const matchesSearch = content.includes(searchTerm) || title.includes(searchTerm);
        const matchesType = !args.type || args.type === "all" || (args.type === "posts" && post.type === "post") || (args.type === "listings" && post.type === "service");
        const matchesPrice = !post.serviceDetails?.price || (!args.minPrice && !args.maxPrice) || (post.serviceDetails.price >= (args.minPrice || 0) && post.serviceDetails.price <= (args.maxPrice || Infinity));
        return matchesSearch && matchesType && matchesPrice;
      });

      filtered.forEach((post) => {
        if (post.type === "service") {
          listings.push(post);
        } else {
          posts.push(post);
        }
      });
    }

    return { users, posts, listings };
  },
});