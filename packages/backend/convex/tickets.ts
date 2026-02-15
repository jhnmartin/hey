import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();

    // Enrich with event details
    return await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          ...ticket,
          eventName: event?.name ?? "Unknown Event",
          eventStartDate: event?.startDate,
          eventVenues: event?.venues,
        };
      }),
    );
  },
});

export const listByEvent = query({
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

    return await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const validate = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (!ticket) throw new Error("Ticket not found");

    if (ticket.status === "used") throw new Error("Ticket already used");
    if (ticket.status !== "valid") throw new Error(`Ticket is ${ticket.status}`);

    await ctx.db.patch(ticket._id, { status: "used" });

    const event = await ctx.db.get(ticket.eventId);
    const profile = await ctx.db.get(ticket.profileId);

    return {
      ticket: { ...ticket, status: "used" as const },
      eventName: event?.name ?? "Unknown Event",
      attendeeName: profile?.name ?? "Unknown",
    };
  },
});
