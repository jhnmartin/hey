"use client"

import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"

export default function BrowseEventsPage() {
  const events = useQuery(api.events.listPublic)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">Browse Events</h1>

      {events === undefined ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted/50 h-64 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-muted/50 mt-6 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No events to show right now.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Check back soon for upcoming events.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event._id}
              href={`/events/${event._id}`}
              className="bg-muted/50 hover:bg-muted/80 overflow-hidden rounded-xl transition-colors"
            >
              {event.coverImageUrl ? (
                <img
                  src={event.coverImageUrl}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="bg-muted aspect-video w-full" />
              )}
              <div className="p-4">
                <h3 className="font-semibold">{event.name}</h3>
                {event.venues && event.venues.length > 0 && (
                  <p className="text-muted-foreground text-sm">
                    {event.venues[0]!.name}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-sm">
                  {event.startDate && (
                    <span className="text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {event.isFreeEvent && (
                    <span className="font-medium">Free</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
