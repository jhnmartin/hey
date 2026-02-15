import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPendingOrder = internalMutation({
  args: {
    profileId: v.id("profiles"),
    eventId: v.id("events"),
    totalAmount: v.number(),
    platformFee: v.number(),
    currency: v.string(),
    items: v.array(v.object({
      ticketTypeId: v.id("ticketTypes"),
      ticketTypeName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
    })),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      ...args,
      status: "pending",
    });
  },
});

export const updateStripeSessionId = internalMutation({
  args: {
    orderId: v.id("orders"),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { stripeSessionId: args.stripeSessionId });
  },
});

export const completeOrder = internalMutation({
  args: {
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeFee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId),
      )
      .unique();
    if (!order) throw new Error("Order not found");
    if (order.status === "completed") return; // idempotent

    // Update order status
    await ctx.db.patch(order._id, {
      status: "completed",
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeFee: args.stripeFee,
    });

    // Create individual ticket records and update sold counts
    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const code = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
        await ctx.db.insert("tickets", {
          orderId: order._id,
          profileId: order.profileId,
          eventId: order.eventId,
          ticketTypeId: item.ticketTypeId,
          ticketTypeName: item.ticketTypeName,
          status: "valid",
          code,
        });
      }

      // Increment sold count on ticket type
      const ticketType = await ctx.db.get(item.ticketTypeId);
      if (ticketType) {
        await ctx.db.patch(item.ticketTypeId, {
          sold: ticketType.sold + item.quantity,
        });
      }
    }
  },
});

export const failOrder = internalMutation({
  args: {
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId),
      )
      .unique();
    if (!order) return;
    if (order.status !== "pending") return;

    await ctx.db.patch(order._id, { status: "failed" });
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

    return await ctx.db
      .query("orders")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();
  },
});

export const getBySessionId = query({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId),
      )
      .unique();
  },
});
