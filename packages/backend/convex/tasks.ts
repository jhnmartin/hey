import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text, isCompleted: false });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tasks").collect();
    if (existing.length > 0) return;

    await ctx.db.insert("tasks", {
      text: "Build the web app",
      isCompleted: true,
    });
    await ctx.db.insert("tasks", {
      text: "Build the mobile app",
      isCompleted: false,
    });
    await ctx.db.insert("tasks", {
      text: "Ship to production",
      isCompleted: false,
    });
  },
});
