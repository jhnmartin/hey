import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const invite = mutation({
  args: {
    eventId: v.id("events"),
    orgId: v.id("organizations"),
    role: v.union(
      v.literal("venue"),
      v.literal("promoter"),
      v.literal("performer"),
      v.literal("production"),
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

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", event.ownerOrgId),
      )
      .unique();
    if (!membership) throw new Error("Not a member of this organization");

    // Check for existing collaborator
    const existing = await ctx.db
      .query("eventCollaborators")
      .withIndex("by_event_org", (q) =>
        q.eq("eventId", args.eventId).eq("orgId", args.orgId),
      )
      .unique();
    if (existing) throw new Error("Organization already invited");

    return await ctx.db.insert("eventCollaborators", {
      ...args,
      invitedBy: profile._id,
      status: "pending",
    });
  },
});

export const accept = mutation({
  args: { id: v.id("eventCollaborators") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const collab = await ctx.db.get(args.id);
    if (!collab) throw new Error("Collaborator not found");

    await ctx.db.patch(args.id, { status: "accepted" });
  },
});

export const decline = mutation({
  args: { id: v.id("eventCollaborators") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const collab = await ctx.db.get(args.id);
    if (!collab) throw new Error("Collaborator not found");

    await ctx.db.patch(args.id, { status: "declined" });
  },
});

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const collabs = await ctx.db
      .query("eventCollaborators")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return await Promise.all(
      collabs.map(async (c) => {
        const org = await ctx.db.get(c.orgId);
        return { ...c, org };
      }),
    );
  },
});
