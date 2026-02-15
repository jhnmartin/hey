"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

export const handleWebhook = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
    const event = stripe.webhooks.constructEvent(
      args.body,
      args.signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await ctx.runMutation(internal.orders.completeOrder, {
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
        });
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await ctx.runMutation(internal.orders.failOrder, {
          stripeSessionId: session.id,
        });
        break;
      }
    }
  },
});
