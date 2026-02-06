import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Browse Events",
}

const events = [
  {
    id: "1",
    name: "Thursday Night Live",
    venue: "The Grand Hall",
    date: "Feb 13, 2025",
    price: "$25",
    rsvps: 234,
  },
  {
    id: "2",
    name: "Rooftop Sunset Party",
    venue: "Sky Lounge",
    date: "Feb 14, 2025",
    price: "$40",
    rsvps: 89,
  },
  {
    id: "3",
    name: "Underground Beats",
    venue: "The Basement",
    date: "Feb 15, 2025",
    price: "$15",
    rsvps: 567,
  },
  {
    id: "4",
    name: "Jazz & Wine Evening",
    venue: "Blue Note Club",
    date: "Feb 20, 2025",
    price: "$35",
    rsvps: 45,
  },
  {
    id: "5",
    name: "Neon Nights Festival",
    venue: "Central Park Arena",
    date: "Feb 21, 2025",
    price: "$50",
    rsvps: 312,
  },
  {
    id: "6",
    name: "Acoustic Sessions",
    venue: "The Library Bar",
    date: "Feb 22, 2025",
    price: "Free",
    rsvps: 78,
  },
]

export default function BrowseEventsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">Browse Events</h1>
      <div className="mt-4 flex gap-2">
        <div className="bg-muted h-10 w-64 rounded-md" />
        <div className="bg-muted h-10 w-32 rounded-md" />
        <div className="bg-muted h-10 w-32 rounded-md" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="bg-muted/50 hover:bg-muted/80 rounded-xl p-6 transition-colors"
          >
            <div className="bg-muted mb-4 aspect-video rounded-lg" />
            <h3 className="font-semibold">{event.name}</h3>
            <p className="text-muted-foreground text-sm">{event.venue}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span>{event.date}</span>
              <span className="font-medium">{event.price}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {event.rsvps} going
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
