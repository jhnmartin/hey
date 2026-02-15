"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

const PLATFORM_FEE_RATE = 0.1; // 10%

export const createCheckoutSession = action({
  args: {
    eventId: v.id("events"),
    items: v.array(v.object({
      ticketTypeId: v.id("ticketTypes"),
      quantity: v.number(),
    })),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.runQuery(internal.ordersHelpers.getProfileByToken, {
      tokenIdentifier: identity.tokenIdentifier,
    });
    if (!profile) throw new Error("Profile not found");

    const event = await ctx.runQuery(internal.ordersHelpers.getEvent, {
      eventId: args.eventId,
    });
    if (!event) throw new Error("Event not found");
    if (event.ticketingMode !== "platform") {
      throw new Error("This event does not use platform ticketing");
    }

    // Fetch and validate ticket types
    const ticketTypes = await ctx.runQuery(internal.ordersHelpers.getTicketTypes, {
      eventId: args.eventId,
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: {
      ticketTypeId: string;
      ticketTypeName: string;
      quantity: number;
      unitPrice: number;
    }[] = [];

    let totalAmount = 0;

    for (const item of args.items) {
      const ticketType = ticketTypes.find((tt) => tt._id === item.ticketTypeId);
      if (!ticketType) throw new Error(`Ticket type not found: ${item.ticketTypeId}`);
      if (ticketType.status !== "active") throw new Error(`Ticket type "${ticketType.name}" is not available`);

      const available = ticketType.quantity - ticketType.sold;
      if (item.quantity > available) {
        throw new Error(`Only ${available} "${ticketType.name}" tickets remaining`);
      }

      const itemTotal = ticketType.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        ticketTypeId: ticketType._id,
        ticketTypeName: ticketType.name,
        quantity: item.quantity,
        unitPrice: ticketType.price,
      });

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${ticketType.name} — ${event.name}`,
          },
          unit_amount: ticketType.price, // already in cents
        },
        quantity: item.quantity,
      });
    }

    const platformFee = Math.round(totalAmount * PLATFORM_FEE_RATE);

    // Create pending order in DB
    const orderId = await ctx.runMutation(internal.orders.createPendingOrder, {
      profileId: profile._id,
      eventId: args.eventId,
      totalAmount,
      platformFee,
      currency: "usd",
      items: orderItems as any,
      stripeSessionId: "pending",
    });

    // Create Stripe Checkout Session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${args.successUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: args.cancelUrl,
      metadata: {
        convexOrderId: orderId,
        eventId: args.eventId,
      },
    });

    // Update order with the actual Stripe session ID
    await ctx.runMutation(internal.orders.updateStripeSessionId, {
      orderId: orderId as any,
      stripeSessionId: session.id,
    });

    return { url: session.url };
  },
});
