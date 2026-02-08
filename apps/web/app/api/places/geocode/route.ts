import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 })
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
  )

  if (!res.ok) {
    return NextResponse.json({ error: "Google API error" }, { status: res.status })
  }

  const data = await res.json()
  const result = data.results?.[0]

  if (!result) {
    return NextResponse.json({ error: "No results" }, { status: 404 })
  }

  return NextResponse.json({
    lat: result.geometry?.location?.lat ?? null,
    lng: result.geometry?.location?.lng ?? null,
    formattedAddress: result.formatted_address ?? "",
  })
}
