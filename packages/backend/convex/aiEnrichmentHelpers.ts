import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getEventForEnrichment = internalQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

export const getOrgForEnrichment = internalQuery({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId);
  },
});

export const markProcessing = internalMutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, { aiEnrichmentStatus: "processing" });
  },
});

export const writeEnrichment = internalMutation({
  args: {
    eventId: v.id("events"),
    seoTitle: v.string(),
    seoDescription: v.string(),
    richDescription: v.string(),
    schemaEventType: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    status: v.union(v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const { eventId, status, ...fields } = args;
    await ctx.db.patch(eventId, {
      ...fields,
      aiEnrichmentStatus: status,
    });
  },
});

export const markFailed = internalMutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, { aiEnrichmentStatus: "failed" });
  },
});
