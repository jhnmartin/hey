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
    avatarStorageId: v.optional(v.id("_storage")),
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
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
      facebook: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    })),
    address: v.optional(v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
    })),
    venues: v.optional(v.array(v.object({
      placeId: v.string(),
      name: v.string(),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zip: v.optional(v.string()),
      lat: v.optional(v.number()),
      lng: v.optional(v.number()),
      verificationStatus: v.union(
        v.literal("claimed"),
        v.literal("pending"),
        v.literal("verified"),
      ),
    }))),
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
  eventSeries: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    seriesType: v.literal("recurring"),
    coverImageId: v.optional(v.id("_storage")),
    ownerOrgId: v.id("organizations"),
    createdBy: v.id("profiles"),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
    ),
    recurrence: v.optional(v.object({
      frequency: v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("biweekly"),
        v.literal("monthly"),
      ),
      dayOfWeek: v.optional(v.number()),
      dayOfMonth: v.optional(v.number()),
      startTime: v.optional(v.string()),
      endTime: v.optional(v.string()),
      doorsOpenTime: v.optional(v.string()),
      seriesStartDate: v.optional(v.string()),
      seriesEndDate: v.optional(v.string()),
    })),
    ticketTemplates: v.optional(v.array(v.object({
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      description: v.optional(v.string()),
    }))),
    defaults: v.optional(v.object({
      ageRestriction: v.optional(v.union(
        v.literal("all_ages"),
        v.literal("18_plus"),
        v.literal("21_plus"),
      )),
      visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
      capacity: v.optional(v.number()),
      isFreeEvent: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
    })),
  })
    .index("by_org", ["ownerOrgId"])
    .index("by_status", ["status"]),
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
      primary: v.optional(v.boolean()),
    }))),
    coverImageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
    publishedAt: v.optional(v.number()),
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
    eventType: v.optional(v.union(
      v.literal("single"),
      v.literal("recurring"),
    )),
    seriesId: v.optional(v.id("eventSeries")),
    seriesOrder: v.optional(v.number()),
    isFreeEvent: v.optional(v.boolean()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    richDescription: v.optional(v.string()),
    schemaEventType: v.optional(v.string()),
    aiEnrichmentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    )),
  })
    .index("by_org", ["ownerOrgId"])
    .index("by_status", ["status"])
    .index("by_org_status", ["ownerOrgId", "status"])
    .index("by_series", ["seriesId"])
    .index("by_series_order", ["seriesId", "seriesOrder"]),
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
  savedEvents: defineTable({
    profileId: v.id("profiles"),
    eventId: v.id("events"),
  })
    .index("by_profile", ["profileId"])
    .index("by_event", ["eventId"])
    .index("by_profile_event", ["profileId", "eventId"]),
  rsvps: defineTable({
    profileId: v.id("profiles"),
    eventId: v.id("events"),
  })
    .index("by_profile", ["profileId"])
    .index("by_event", ["eventId"])
    .index("by_profile_event", ["profileId", "eventId"]),
});
