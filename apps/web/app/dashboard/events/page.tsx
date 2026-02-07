"use client"

import Link from "next/link"
import { useOrg } from "@/components/org-context"
import { allEvents } from "@/lib/dummy-events"

export default function EventsPage() {
  const { activeOrg } = useOrg()
  const events = allEvents.filter((e) => e.org === activeOrg?.name)

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href="/dashboard/events/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
        >
          Create Event
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/dashboard/events/${event.id}`}
            className="bg-muted/50 hover:bg-muted/80 rounded-xl p-6 transition-colors"
          >
            <h3 className="font-semibold">{event.name}</h3>
            <p className="text-muted-foreground text-sm">{event.venue}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>{event.date}</span>
              <span className="font-medium">{event.price}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {event.rsvps} RSVPs
            </p>
          </Link>
        ))}
      </div>
    </>
  )
}
