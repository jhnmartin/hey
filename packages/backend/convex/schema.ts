import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  profiles: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    city: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    role: v.union(v.literal("attendee"), v.literal("organizer")),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),
  organizations: defineTable({
    name: v.string(),
    role: v.union(
      v.literal("venue"),
      v.literal("performer"),
      v.literal("promoter"),
    ),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    ownerId: v.id("profiles"),
  }).index("by_owner", ["ownerId"]),
  memberships: defineTable({
    profileId: v.id("profiles"),
    orgId: v.id("organizations"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
    ),
  })
    .index("by_profile", ["profileId"])
    .index("by_org", ["orgId"])
    .index("by_profile_org", ["profileId", "orgId"]),
  invites: defineTable({
    orgId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    invitedBy: v.id("profiles"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
  })
    .index("by_email", ["email"])
    .index("by_org", ["orgId"])
    .index("by_email_status", ["email", "status"]),
});
