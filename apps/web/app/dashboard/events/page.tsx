"use client"

import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useOrg } from "@/components/org-context"
import { Badge } from "@/components/ui/badge"

export default function EventsPage() {
  const { activeOrg } = useOrg()
  const events = useQuery(
    api.events.listByOrg,
    activeOrg ? { orgId: activeOrg._id } : "skip",
  )

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

      {!events ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted/50 h-40 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-muted/50 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No events yet.</p>
          <Link
            href="/dashboard/events/new"
            className="text-primary mt-2 inline-block text-sm underline"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event._id}
              href={`/dashboard/events/${event._id}`}
              className="bg-muted/50 hover:bg-muted/80 overflow-hidden rounded-xl transition-colors"
            >
              {event.coverImageUrl && (
                <img
                  src={event.coverImageUrl}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{event.name}</h3>
                  <Badge
                    variant={
                      event.status === "published" ? "default" : "secondary"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                {event.venues && event.venues.length > 0 && (
                  <p className="text-muted-foreground text-sm">
                    {event.venues[0]!.name}
                  </p>
                )}
                {event.startDate && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
