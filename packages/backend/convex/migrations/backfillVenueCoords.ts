import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * One-time migration: geocode venue addresses on existing events and patch lat/lng.
 * Run from the Convex dashboard after deploying the schema changes.
 */
export const run = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");

    const events = await ctx.runQuery(internal.events._listAll);
    let updated = 0;
    let skipped = 0;

    for (const event of events) {
      if (!event.venues || event.venues.length === 0) {
        skipped++;
        continue;
      }

      let changed = false;
      const updatedVenues = await Promise.all(
        event.venues.map(async (venue) => {
          // Skip if already has coordinates
          if (venue.lat != null && venue.lng != null) return venue;

          const address = [venue.name, venue.address, venue.city, venue.state, venue.zip]
            .filter(Boolean)
            .join(", ");

          if (!address) return venue;

          try {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
            );
            const data = await res.json();
            const result = data.results?.[0];
            if (result?.geometry?.location) {
              changed = true;
              return {
                ...venue,
                lat: result.geometry.location.lat as number,
                lng: result.geometry.location.lng as number,
              };
            }
          } catch {
            // skip on error
          }
          return venue;
        }),
      );

      if (changed) {
        await ctx.runMutation(internal.events._patchVenues, {
          id: event._id,
          venues: updatedVenues,
        });
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`Backfill complete: ${updated} updated, ${skipped} skipped`);
  },
});
