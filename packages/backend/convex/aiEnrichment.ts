"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { generateObject, gateway } from "ai";
import { z } from "zod";

const enrichmentSchema = z.object({
  seoTitle: z.string().describe("SEO-optimized title, 60-70 characters, includes event name and location"),
  seoDescription: z.string().describe("Meta description, 150-160 characters, compelling click-driver for search results"),
  richDescription: z.string().describe("2-4 paragraph marketing copy expanding the organizer's summary, second-person voice, engaging tone"),
  schemaEventType: z.enum([
    "MusicEvent",
    "DanceEvent",
    "Festival",
    "SocialEvent",
    "ComedyEvent",
    "TheaterEvent",
    "EducationEvent",
    "Event",
  ]).describe("schema.org @type for JSON-LD structured data"),
  category: z.string().describe("Single category string, e.g. 'Live Music', 'DJ Night', 'Club Night', 'Comedy Show'"),
  tags: z.array(z.string()).min(3).max(5).describe("3-5 lowercase discovery tags for search and filtering"),
});

export const enrichEvent = internalAction({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    // Mark as processing
    await ctx.runMutation(internal.aiEnrichmentHelpers.markProcessing, {
      eventId: args.eventId,
    });

    try {
      // Fetch event data
      const event = await ctx.runQuery(internal.aiEnrichmentHelpers.getEventForEnrichment, {
        eventId: args.eventId,
      });
      if (!event) throw new Error("Event not found");

      // Fetch org data
      const org = await ctx.runQuery(internal.aiEnrichmentHelpers.getOrgForEnrichment, {
        orgId: event.ownerOrgId,
      });

      // Build context
      const venue = event.venues?.[0];
      const locationStr = venue
        ? [venue.name, venue.city, venue.state].filter(Boolean).join(", ")
        : "Location TBD";

      const dateStr = event.startDate
        ? new Date(event.startDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Date TBD";

      const orgContext = org
        ? `Organized by ${org.name} (${org.role})${org.description ? `. ${org.description}` : ""}`
        : "";

      const performerHint = org?.role === "performer"
        ? `\nNote: The organizing entity is a performer — consider this a performance/show.`
        : "";

      const ageStr = event.ageRestriction === "21_plus"
        ? "21+"
        : event.ageRestriction === "18_plus"
          ? "18+"
          : "All ages";

      const eventTypeStr = event.eventType === "recurring" ? "Recurring event" : "Single event";

      const prompt = `You are a nightlife and live events marketing expert. Generate SEO-optimized content for this event listing.

Event details:
- Name: ${event.name}
- Description: ${event.description || "No description provided"}
- Date: ${dateStr}
- Location: ${locationStr}
- ${orgContext}${performerHint}
- Age restriction: ${ageStr}
- Event type: ${eventTypeStr}

Guidelines:
- The seoTitle should be compelling and include the event name and location when possible
- The seoDescription should drive clicks from search results
- The richDescription should expand on the organizer's input with engaging, second-person marketing copy ("you'll experience...", "join us for...")
- Choose the most specific schemaEventType that fits
- The category should be a concise label for the type of event
- Tags should be lowercase, relevant discovery terms for search and filtering`;

      const { object } = await generateObject({
        model: gateway("openai/gpt-4o-mini"),
        schema: enrichmentSchema,
        prompt,
      });

      // Write results
      await ctx.runMutation(internal.aiEnrichmentHelpers.writeEnrichment, {
        eventId: args.eventId,
        seoTitle: object.seoTitle,
        seoDescription: object.seoDescription,
        richDescription: object.richDescription,
        schemaEventType: object.schemaEventType,
        category: object.category,
        tags: object.tags,
        status: "completed",
      });
    } catch (error) {
      console.error("AI enrichment failed:", error);
      await ctx.runMutation(internal.aiEnrichmentHelpers.markFailed, {
        eventId: args.eventId,
      });
    }
  },
});
