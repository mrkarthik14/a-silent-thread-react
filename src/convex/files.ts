import { query } from "./_generated/server";
import { v } from "convex/values";

export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as any);
  },
});

export const getImageUrls = query({
  args: { storageIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const urls = await Promise.all(args.storageIds.map(id => ctx.storage.getUrl(id as any)));
    return urls.filter((u): u is string => u !== null);
  },
});