import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    serviceId: v.id("posts"),
    message: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service || service.type !== "service") {
      throw new Error("Service not found");
    }

    return await ctx.db.insert("bookings", {
      serviceId: args.serviceId,
      renterId: user._id,
      ownerId: service.userId,
      message: args.message,
      date: args.date,
      status: "pending",
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const bookings = await ctx.db
      .query("bookings")
      .filter((q) =>
        q.or(
          q.eq(q.field("renterId"), user._id),
          q.eq(q.field("ownerId"), user._id)
        )
      )
      .order("desc")
      .collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const service = await ctx.db.get(booking.serviceId);
        const renter = await ctx.db.get(booking.renterId);
        const owner = await ctx.db.get(booking.ownerId);
        return { ...booking, service, renter, owner };
      })
    );
  },
});

export const updateStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.ownerId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
  },
});
