import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!profile) return null;

    // Resolve avatarStorageId to a URL, falling back to stored avatarUrl
    let avatarUrl = profile.avatarUrl ?? null;
    if (profile.avatarStorageId) {
      const url = await ctx.storage.getUrl(profile.avatarStorageId);
      if (url) avatarUrl = url;
    }

    return { ...profile, avatarUrl };
  },
});

export const getOrCreate = mutation({
  args: {
    role: v.optional(
      v.union(v.literal("attendee"), v.literal("organizer")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("profiles", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? "",
      email: identity.email ?? "",
      avatarUrl: undefined,
      role: args.role ?? "attendee",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("profiles"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    city: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("attendee"), v.literal("organizer")),
    ),
    homeLat: v.optional(v.number()),
    homeLng: v.optional(v.number()),
    homeLocationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db.get(args.id);
    if (!profile || profile.tokenIdentifier !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }

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
