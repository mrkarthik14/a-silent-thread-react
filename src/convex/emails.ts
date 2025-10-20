"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendBookingConfirmationEmail = internalAction({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("accepted"),
      v.literal("rejected")
    ),
    renterEmail: v.string(),
    ownerEmail: v.string(),
    serviceTitle: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("Resend API key not configured. Skipping email.");
      return;
    }

    const resend = new Resend(apiKey);

    const subject = args.status === "accepted" 
      ? `Booking Confirmed: ${args.serviceTitle}`
      : `Booking Rejected: ${args.serviceTitle}`;

    const message = args.status === "accepted"
      ? `Your booking for ${args.serviceTitle} on ${args.date} has been accepted!`
      : `Your booking for ${args.serviceTitle} on ${args.date} has been rejected.`;

    try {
      // Send email to renter
      await resend.emails.send({
        from: "noreply@silentthread.com",
        to: args.renterEmail,
        subject,
        html: `<p>${message}</p>`,
      });

      // Send email to owner
      await resend.emails.send({
        from: "noreply@silentthread.com",
        to: args.ownerEmail,
        subject: `Booking ${args.status}: ${args.serviceTitle}`,
        html: `<p>You have ${args.status} a booking for ${args.serviceTitle} on ${args.date}.</p>`,
      });
    } catch (error) {
      console.error("Failed to send booking email:", error);
    }
  },
});
