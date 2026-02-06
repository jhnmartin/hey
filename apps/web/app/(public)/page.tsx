import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "hey thursday — Discover the best events near you",
}

const featuredEvents = [
  {
    id: "1",
    name: "Thursday Night Live",
    venue: "The Grand Hall",
    date: "Feb 13",
    price: "$25",
    rsvps: 234,
  },
  {
    id: "2",
    name: "Rooftop Sunset Party",
    venue: "Sky Lounge",
    date: "Feb 14",
    price: "$40",
    rsvps: 89,
  },
  {
    id: "3",
    name: "Underground Beats",
    venue: "The Basement",
    date: "Feb 15",
    price: "$15",
    rsvps: 567,
  },
  {
    id: "4",
    name: "Jazz & Wine Evening",
    venue: "Blue Note Club",
    date: "Feb 20",
    price: "$35",
    rsvps: 45,
  },
  {
    id: "5",
    name: "Neon Nights Festival",
    venue: "Central Park Arena",
    date: "Feb 21",
    price: "$50",
    rsvps: 312,
  },
  {
    id: "6",
    name: "Acoustic Sessions",
    venue: "The Library Bar",
    date: "Feb 22",
    price: "Free",
    rsvps: 78,
  },
]

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          We take the guesswork
          <br />
          out of nightlife.
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-lg">
          Discover the best events near you. RSVP, grab tickets, and never miss
          a night out again.
        </p>
        <div className="mt-8">
          <Link
            href="/events"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-6 py-3 text-sm font-medium"
          >
            Browse Events
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="mb-6 text-2xl font-bold">Trending This Week</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
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
      </section>
    </>
  )
}
