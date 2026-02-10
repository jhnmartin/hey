import { action } from "./_generated/server";
import { v } from "convex/values";

export const autocomplete = action({
  args: { input: v.string() },
  handler: async (ctx, args) => {
    if (args.input.length < 2) return { suggestions: [] };

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");

    const res = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({ input: args.input }),
      },
    );

    if (!res.ok) throw new Error(`Google API error: ${res.status}`);

    const data = await res.json();
    const suggestions = (data.suggestions ?? []).map((s: any) => ({
      placeId: s.placePrediction?.placeId ?? "",
      mainText:
        s.placePrediction?.structuredFormat?.mainText?.text ?? "",
      secondaryText:
        s.placePrediction?.structuredFormat?.secondaryText?.text ?? "",
      fullText: s.placePrediction?.text?.text ?? "",
    }));

    return { suggestions };
  },
});

export const getDetails = action({
  args: { placeId: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${args.placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "displayName,formattedAddress,addressComponents,location",
        },
      },
    );

    if (!res.ok) throw new Error(`Google API error: ${res.status}`);

    const data = await res.json();
    const components = data.addressComponents ?? [];

    function getComponent(type: string, useShort = false): string {
      const comp = components.find((c: any) => c.types?.includes(type));
      return comp ? (useShort ? comp.shortText : comp.longText) : "";
    }

    const streetNumber = getComponent("street_number");
    const route = getComponent("route");

    return {
      name: data.displayName?.text ?? "",
      formattedAddress: data.formattedAddress ?? "",
      address: [streetNumber, route].filter(Boolean).join(" "),
      city: getComponent("locality") || getComponent("sublocality"),
      state: getComponent("administrative_area_level_1", true),
      zip: getComponent("postal_code"),
      lat: data.location?.latitude ?? null,
      lng: data.location?.longitude ?? null,
    };
  },
});
