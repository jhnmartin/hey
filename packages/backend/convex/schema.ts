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
  events: defineTable({
    name: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    doorsOpen: v.optional(v.number()),
    venues: v.optional(v.array(v.object({
      name: v.string(),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
    }))),
    coverImageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
    visibility: v.union(v.literal("public"), v.literal("private")),
    lifecycle: v.union(
      v.literal("upcoming"),
      v.literal("postponed"),
      v.literal("started"),
      v.literal("ended"),
      v.literal("cancelled"),
    ),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    ageRestriction: v.union(
      v.literal("all_ages"),
      v.literal("18_plus"),
      v.literal("21_plus"),
    ),
    capacity: v.optional(v.number()),
    ownerOrgId: v.id("organizations"),
    createdBy: v.id("profiles"),
  })
    .index("by_org", ["ownerOrgId"])
    .index("by_status", ["status"])
    .index("by_org_status", ["ownerOrgId", "status"]),
  ticketTypes: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    quantity: v.number(),
    sold: v.number(),
    sortOrder: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("sold_out"),
      v.literal("hidden"),
    ),
  }).index("by_event", ["eventId"]),
  eventTags: defineTable({
    name: v.string(),
  })
    .index("by_name", ["name"])
    .searchIndex("search_name", { searchField: "name" }),
  eventCollaborators: defineTable({
    eventId: v.id("events"),
    orgId: v.id("organizations"),
    role: v.union(
      v.literal("venue"),
      v.literal("promoter"),
      v.literal("performer"),
      v.literal("production"),
    ),
    invitedBy: v.id("profiles"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
  })
    .index("by_event", ["eventId"])
    .index("by_org", ["orgId"])
    .index("by_event_org", ["eventId", "orgId"]),
});
