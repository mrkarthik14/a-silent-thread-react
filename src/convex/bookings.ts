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

    // Check if user already has a booking for this service
    const existingBooking = await ctx.db
      .query("bookings")
      .withIndex("by_renter", (q) => q.eq("renterId", user._id))
      .filter((q) => q.eq(q.field("serviceId"), args.serviceId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .first();

    if (existingBooking) {
      throw new Error("You have already booked this service");
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

export const getBookingCountByService = query({
  args: {
    serviceId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .collect();

    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  },
});

export const getUserBookingForService = query({
  args: {
    serviceId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_renter", (q) => q.eq("renterId", user._id))
      .filter((q) => q.eq(q.field("serviceId"), args.serviceId))
      .unique();

    return booking || null;
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

export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.renterId !== user._id) {
      throw new Error("Only the renter can cancel the booking");
    }

    if (booking.status === "completed" || booking.status === "rejected") {
      throw new Error("Cannot cancel a completed or rejected booking");
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
    });

    // Send cancellation emails
    const renter = await ctx.db.get(booking.renterId);
    const owner = await ctx.db.get(booking.ownerId);
    const service = await ctx.db.get(booking.serviceId);

    if (renter?.email && owner?.email && service?.serviceDetails) {
      await ctx.scheduler.runAfter(
        0,
        internal.emails.sendBookingCancellationEmail,
        {
          bookingId: args.bookingId,
          renterEmail: renter.email,
          ownerEmail: owner.email,
          serviceTitle: service.serviceDetails.title,
          date: booking.date,
          renterName: renter.name || "User",
        }
      );
    }
  },
});