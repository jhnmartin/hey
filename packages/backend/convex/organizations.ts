import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    role: v.union(
      v.literal("venue"),
      v.literal("performer"),
      v.literal("promoter"),
    ),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    ownerId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("organizations", args);
  },
});

export const listByOwner = query({
  args: { ownerId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("venue"),
        v.literal("performer"),
        v.literal("promoter"),
      ),
    ),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});
