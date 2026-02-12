import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";

export const create = mutation({
  args: {
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
    ),
    visibility: v.union(v.literal("public"), v.literal("private")),
    tags: v.optional(v.array(v.string())),
    ageRestriction: v.union(
      v.literal("all_ages"),
      v.literal("18_plus"),
      v.literal("21_plus"),
    ),
    capacity: v.optional(v.number()),
    ownerOrgId: v.id("organizations"),
    eventType: v.optional(v.union(
      v.literal("single"),
      v.literal("recurring"),
    )),
    seriesId: v.optional(v.id("eventSeries")),
    seriesOrder: v.optional(v.number()),
    isFreeEvent: v.optional(v.boolean()),
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

    const eventId = await ctx.db.insert("events", {
      ...args,
      lifecycle: "upcoming",
      createdBy: profile._id,
      aiEnrichmentStatus: "pending",
    });

    // Schedule AI enrichment to run immediately
    await ctx.scheduler.runAfter(0, internal.aiEnrichment.enrichEvent, { eventId });

    return eventId;
  },
});

export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) return null;

    let coverImageUrl: string | null = null;
    if (event.coverImageId) {
      coverImageUrl = await ctx.storage.getUrl(event.coverImageId);
    }

    return { ...event, coverImageUrl };
  },
});

export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_org", (q) => q.eq("ownerOrgId", args.orgId))
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

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const publicEvents = events.filter(
      (e) => e.visibility === "public" && e.lifecycle !== "cancelled",
    );

    return await Promise.all(
      publicEvents.map(async (event) => {
        let coverImageUrl: string | null = null;
        if (event.coverImageId) {
          coverImageUrl = await ctx.storage.getUrl(event.coverImageId);
        }
        return { ...event, coverImageUrl };
      }),
    );
  },
});

export const listByIds = query({
  args: { ids: v.array(v.id("events")) },
  handler: async (ctx, args) => {
    const events = await Promise.all(
      args.ids.map((id) => ctx.db.get(id)),
    );
    return await Promise.all(
      events
        .filter((e): e is NonNullable<typeof e> => e !== null)
        .map(async (event) => {
          let coverImageUrl: string | null = null;
          if (event.coverImageId) {
            coverImageUrl = await ctx.storage.getUrl(event.coverImageId);
          }
          return { ...event, coverImageUrl };
        }),
    );
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    name: v.optional(v.string()),
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
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
    tags: v.optional(v.array(v.string())),
    ageRestriction: v.optional(
      v.union(
        v.literal("all_ages"),
        v.literal("18_plus"),
        v.literal("21_plus"),
      ),
    ),
    capacity: v.optional(v.number()),
    eventType: v.optional(v.union(
      v.literal("single"),
      v.literal("recurring"),
    )),
    isFreeEvent: v.optional(v.boolean()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    richDescription: v.optional(v.string()),
    schemaEventType: v.optional(v.string()),
    category: v.optional(v.string()),
    aiEnrichmentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    )),
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

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    // Verify membership in the event's org
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", event.ownerOrgId),
      )
      .unique();
    if (!membership) throw new Error("Not a member of this organization");

    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const retryEnrichment = mutation({
  args: { id: v.id("events") },
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

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", event.ownerOrgId),
      )
      .unique();
    if (!membership) throw new Error("Not a member of this organization");

    await ctx.db.patch(args.id, { aiEnrichmentStatus: "pending" });
    await ctx.scheduler.runAfter(0, internal.aiEnrichment.enrichEvent, { eventId: args.id });
  },
});

export const publish = mutation({
  args: { id: v.id("events") },
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

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", event.ownerOrgId),
      )
      .unique();
    if (!membership) throw new Error("Not a member of this organization");

    // Enforce required fields for publishing
    // Series events (recurring) may not require venues at creation time
    if (!event.startDate) throw new ConvexError("Start date is required to publish");
    if (!event.seriesId && (!event.venues || event.venues.length === 0)) {
      throw new ConvexError("At least one venue is required to publish");
    }

    await ctx.db.patch(args.id, { status: "published" });
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
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

    const event = await ctx.db.get(args.id);
    if (!event) throw new ConvexError("Event not found");

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", event.ownerOrgId),
      )
      .unique();
    if (!membership) throw new ConvexError("Not a member of this organization");

    // Cascade delete related records
    const ticketTypes = await ctx.db
      .query("ticketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();
    for (const tt of ticketTypes) {
      await ctx.db.delete(tt._id);
    }

    const collaborators = await ctx.db
      .query("eventCollaborators")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();
    for (const c of collaborators) {
      await ctx.db.delete(c._id);
    }

    const savedEvents = await ctx.db
      .query("savedEvents")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();
    for (const s of savedEvents) {
      await ctx.db.delete(s._id);
    }

    const rsvps = await ctx.db
      .query("rsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();
    for (const r of rsvps) {
      await ctx.db.delete(r._id);
    }

    // Delete the cover image from storage if it exists
    if (event.coverImageId) {
      await ctx.storage.delete(event.coverImageId);
    }

    await ctx.db.delete(args.id);
  },
});

export const archive = mutation({
  args: { id: v.id("events") },
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

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", event.ownerOrgId),
      )
      .unique();
    if (!membership) throw new Error("Not a member of this organization");

    await ctx.db.patch(args.id, { status: "archived" });
  },
});
