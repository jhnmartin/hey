import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (args.query.length === 0) {
      // Return all tags when empty (for initial display)
      return await ctx.db.query("eventTags").collect();
    }

    return await ctx.db
      .query("eventTags")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const normalized = args.name.trim().toLowerCase();
    if (normalized.length === 0) throw new Error("Tag name cannot be empty");

    // Check if tag already exists
    const existing = await ctx.db
      .query("eventTags")
      .withIndex("by_name", (q) => q.eq("name", normalized))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("eventTags", { name: normalized });
  },
});
