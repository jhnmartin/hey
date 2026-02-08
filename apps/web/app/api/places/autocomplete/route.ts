import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { input } = await req.json()
  if (!input || typeof input !== "string") {
    return NextResponse.json({ suggestions: [] })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 })
  }

  const res = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({ input }),
    },
  )

  if (!res.ok) {
    return NextResponse.json({ error: "Google API error" }, { status: res.status })
  }

  const data = await res.json()
  const suggestions = (data.suggestions ?? []).map(
    (s: any) => ({
      placeId: s.placePrediction?.placeId ?? "",
      mainText: s.placePrediction?.structuredFormat?.mainText?.text ?? "",
      secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text ?? "",
      fullText: s.placePrediction?.text?.text ?? "",
    }),
  )

  return NextResponse.json({ suggestions })
}
