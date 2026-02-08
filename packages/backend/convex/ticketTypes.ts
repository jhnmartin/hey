import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    quantity: v.number(),
    sortOrder: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("sold_out"),
      v.literal("hidden"),
    ),
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

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Verify membership in the event's org
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", event.ownerOrgId),
      )
      .unique();
    if (!membership) throw new Error("Not a member of this organization");

    return await ctx.db.insert("ticketTypes", {
      ...args,
      sold: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("ticketTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    quantity: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("sold_out"),
        v.literal("hidden"),
      ),
    ),
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

    const ticketType = await ctx.db.get(args.id);
    if (!ticketType) throw new Error("Ticket type not found");

    const event = await ctx.db.get(ticketType.eventId);
    if (!event) throw new Error("Event not found");

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

export const remove = mutation({
  args: { id: v.id("ticketTypes") },
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

    const ticketType = await ctx.db.get(args.id);
    if (!ticketType) throw new Error("Ticket type not found");

    const event = await ctx.db.get(ticketType.eventId);
    if (!event) throw new Error("Event not found");

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", event.ownerOrgId),
      )
      .unique();
    if (!membership) throw new Error("Not a member of this organization");

    await ctx.db.delete(args.id);
  },
});

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ticketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});
