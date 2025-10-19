import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      bio: v.optional(v.string()),
      location: v.optional(v.string()),
    }).index("email", ["email"]),

    posts: defineTable({
      userId: v.id("users"),
      content: v.string(),
      image: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
      videos: v.optional(v.array(v.string())),
      type: v.union(v.literal("post"), v.literal("service")),
      serviceDetails: v.optional(v.object({
        title: v.string(),
        price: v.number(),
        category: v.string(),
      })),
      parentId: v.optional(v.id("posts")),
      likes: v.number(),
      replies: v.number(),
    }).index("by_user", ["userId"])
      .index("by_parent", ["parentId"])
      .index("by_type", ["type"]),

    bookings: defineTable({
      serviceId: v.id("posts"),
      renterId: v.id("users"),
      ownerId: v.id("users"),
      message: v.string(),
      date: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected"),
        v.literal("completed")
      ),
    }).index("by_renter", ["renterId"])
      .index("by_owner", ["ownerId"])
      .index("by_service", ["serviceId"]),

    messages: defineTable({
      senderId: v.id("users"),
      recipientId: v.id("users"),
      content: v.string(),
      read: v.boolean(),
    }).index("by_sender", ["senderId"])
      .index("by_recipient", ["recipientId"]),

    notifications: defineTable({
      userId: v.id("users"),
      type: v.string(),
      content: v.string(),
      read: v.boolean(),
      relatedId: v.optional(v.string()),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;