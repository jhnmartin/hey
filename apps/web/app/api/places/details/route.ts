import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId")
  if (!placeId) {
    return NextResponse.json({ error: "Missing placeId" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 })
  }

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "displayName,formattedAddress,addressComponents,location",
      },
    },
  )

  if (!res.ok) {
    return NextResponse.json({ error: "Google API error" }, { status: res.status })
  }

  const data = await res.json()

  const components = data.addressComponents ?? []
  function getComponent(type: string, useShort = false): string {
    const comp = components.find((c: any) =>
      c.types?.includes(type),
    )
    return comp ? (useShort ? comp.shortText : comp.longText) : ""
  }

  const streetNumber = getComponent("street_number")
  const route = getComponent("route")

  return NextResponse.json({
    name: data.displayName?.text ?? "",
    formattedAddress: data.formattedAddress ?? "",
    address: [streetNumber, route].filter(Boolean).join(" "),
    city: getComponent("locality") || getComponent("sublocality"),
    state: getComponent("administrative_area_level_1", true),
    zip: getComponent("postal_code"),
    lat: data.location?.latitude ?? null,
    lng: data.location?.longitude ?? null,
  })
}
