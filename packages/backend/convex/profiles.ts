import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("profiles").first();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("profiles").first();
    if (existing) return;

    await ctx.db.insert("profiles", {
      name: "Jordan Smith",
      email: "jordan@heythursday.app",
      city: "Austin, TX",
      bio: "Music lover and event-goer.",
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
    city: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // Remove undefined fields so patch only updates provided values
    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});
