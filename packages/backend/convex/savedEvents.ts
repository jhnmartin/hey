import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggle = mutation({
  args: { eventId: v.id("events") },
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

    const existing = await ctx.db
      .query("savedEvents")
      .withIndex("by_profile_event", (q) =>
        q.eq("profileId", profile._id).eq("eventId", args.eventId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    }

    // Remove any existing RSVP (save and RSVP are mutually exclusive)
    const existingRsvp = await ctx.db
      .query("rsvps")
      .withIndex("by_profile_event", (q) =>
        q.eq("profileId", profile._id).eq("eventId", args.eventId),
      )
      .unique();
    if (existingRsvp) {
      await ctx.db.delete(existingRsvp._id);
    }

    await ctx.db.insert("savedEvents", {
      profileId: profile._id,
      eventId: args.eventId,
    });
    return { saved: true };
  },
});

export const listByProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!profile) return [];

    const saved = await ctx.db
      .query("savedEvents")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();

    return saved.map((s) => s.eventId);
  },
});
