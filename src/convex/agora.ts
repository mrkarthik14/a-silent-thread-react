"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
// @ts-ignore
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { auth } from "./auth";

export const generateToken = action({
  args: {
    channelName: v.string(),
    role: v.union(v.literal("publisher"), v.literal("subscriber")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthenticated");
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      throw new Error("Agora credentials not configured");
    }

    const rtcRole = args.role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Use 0 for uid to let Agora assign one, or use a numeric mapping of the userId if needed.
    // For simplicity in this integration, we'll use 0 (wildcard) or a random int for the token, 
    // but the client will join with their own numeric ID if possible, or 0.
    // Here we generate a token for uid 0 which allows any uid to join with this token if we don't enforce it,
    // OR we can generate a random numeric ID for this user session.
    
    // Let's generate a random numeric UID for this user for this session
    const uid = Math.floor(Math.random() * 100000);

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      args.channelName,
      uid,
      rtcRole,
      privilegeExpiredTs
    );

    return { token, uid, appId };
  },
});