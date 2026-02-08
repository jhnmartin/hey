import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const venueValidator = v.object({
  name: v.string(),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zip: v.optional(v.string()),
});

const ticketTemplateValidator = v.object({
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  description: v.optional(v.string()),
});

export const create = mutation({
  args: {
    // Series-level fields
    name: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    seriesType: v.union(
      v.literal("recurring"),
      v.literal("tour"),
      v.literal("multi_location"),
    ),
    coverImageId: v.optional(v.id("_storage")),
    ownerOrgId: v.id("organizations"),

    // Classification (shared across all events)
    isFreeEvent: v.boolean(),
    ageRestriction: v.union(
      v.literal("all_ages"),
      v.literal("18_plus"),
      v.literal("21_plus"),
    ),
    visibility: v.union(v.literal("public"), v.literal("private")),
    capacity: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),

    // Ticket templates (applied to each generated event)
    ticketTemplates: v.array(ticketTemplateValidator),

    // Recurrence config (recurring only)
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

    // Generated events data
    // Each entry becomes an individual event row
    events: v.array(v.object({
      name: v.string(),
      tagline: v.optional(v.string()),
      description: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      doorsOpen: v.optional(v.number()),
      venues: v.optional(v.array(venueValidator)),
      coverImageId: v.optional(v.id("_storage")),
    })),

    // Status for the created events
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!profile) throw new Error("Profile not found");

    // Verify membership in the org
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", args.ownerOrgId),
      )
      .unique();
    if (!membership) throw new Error("Not a member of this organization");

    // Create the series record
    const seriesId = await ctx.db.insert("eventSeries", {
      name: args.name,
      description: args.description,
      seriesType: args.seriesType,
      coverImageId: args.coverImageId,
      ownerOrgId: args.ownerOrgId,
      createdBy: profile._id,
      status: "active",
      recurrence: args.recurrence,
      ticketTemplates: args.ticketTemplates,
      defaults: {
        ageRestriction: args.ageRestriction,
        visibility: args.visibility,
        capacity: args.capacity,
        isFreeEvent: args.isFreeEvent,
        tags: args.tags,
      },
    });

    // Create individual events
    const eventIds = [];
    for (let i = 0; i < args.events.length; i++) {
      const eventData = args.events[i]!;
      const eventId = await ctx.db.insert("events", {
        name: eventData.name,
        tagline: eventData.tagline,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        doorsOpen: eventData.doorsOpen,
        venues: eventData.venues,
        coverImageId: eventData.coverImageId ?? args.coverImageId,
        status: args.status,
        visibility: args.visibility,
        lifecycle: "upcoming",
        tags: args.tags,
        ageRestriction: args.ageRestriction,
        capacity: args.capacity,
        ownerOrgId: args.ownerOrgId,
        createdBy: profile._id,
        eventType: args.seriesType,
        seriesId,
        seriesOrder: i + 1,
        isFreeEvent: args.isFreeEvent,
      });

      // Create ticket types for this event from templates
      for (let j = 0; j < args.ticketTemplates.length; j++) {
        const template = args.ticketTemplates[j]!;
        await ctx.db.insert("ticketTypes", {
          eventId,
          name: template.name,
          description: template.description,
          price: args.isFreeEvent ? 0 : template.price,
          quantity: template.quantity,
          sold: 0,
          sortOrder: j,
          status: "active",
        });
      }

      eventIds.push(eventId);
    }

    return { seriesId, eventIds };
  },
});

export const get = query({
  args: { id: v.id("eventSeries") },
  handler: async (ctx, args) => {
    const series = await ctx.db.get(args.id);
    if (!series) return null;

    let coverImageUrl: string | null = null;
    if (series.coverImageId) {
      coverImageUrl = await ctx.storage.getUrl(series.coverImageId);
    }

    return { ...series, coverImageUrl };
  },
});

export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("eventSeries")
      .withIndex("by_org", (q) => q.eq("ownerOrgId", args.orgId))
      .collect();
  },
});

export const listEvents = query({
  args: { seriesId: v.id("eventSeries") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_series_order", (q) => q.eq("seriesId", args.seriesId))
      .collect();

    return await Promise.all(
      events.map(async (event) => {
        let coverImageUrl: string | null = null;
        if (event.coverImageId) {
          coverImageUrl = await ctx.storage.getUrl(event.coverImageId);
        }
        return { ...event, coverImageUrl };
      }),
    );
  },
});
