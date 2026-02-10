"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { IconMapPin } from "@tabler/icons-react"
import { SetPageTitle } from "@/components/page-title-context"

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const event = useQuery(api.events.get, id ? { id: id as any } : "skip")

  if (event === undefined) {
    return (
      <>
        <SetPageTitle title="Event Detail" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </>
    )
  }

  if (event === null) {
    return (
      <>
        <SetPageTitle title="Event Detail" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Event not found</p>
        </div>
      </>
    )
  }

  const venue = event.venues?.[0]

  return (
    <>
      <SetPageTitle title={event.name} />
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2.5 py-0.5 text-xs font-medium capitalize ${event.status === "published" ? "bg-green-600/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
            {event.status}
          </span>
          {event.eventType && (
            <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-0.5 text-xs font-medium capitalize">
              {event.eventType}
            </span>
          )}
        </div>
        <Link
          href={`/dashboard/events/${id}/analytics`}
          className="bg-muted hover:bg-muted/80 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
        >
          View Analytics
        </Link>
      </div>

      <div className="bg-muted/50 rounded-xl p-6">
        <h2 className="text-xl font-semibold">{event.name}</h2>
        {venue && (
          <div className="text-muted-foreground mt-1 flex items-center gap-1.5">
            <IconMapPin className="size-4" />
            <span>
              {venue.name}
              {venue.city ? `, ${venue.city}` : ""}
              {venue.state ? `, ${venue.state}` : ""}
            </span>
          </div>
        )}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Date</p>
            <p className="font-medium">
              {event.startDate
                ? new Date(event.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Not set"}
            </p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Time</p>
            <p className="font-medium">
              {event.startDate
                ? new Date(event.startDate).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Not set"}
            </p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Visibility</p>
            <p className="font-medium capitalize">{event.visibility}</p>
          </div>
        </div>
      </div>

      {event.description && (
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold">About</h3>
          <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      )}

      {venue && venue.address && (
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold">Venue</h3>
          <p className="mt-2 text-sm font-medium">{venue.name}</p>
          <p className="text-muted-foreground text-sm">
            {[venue.address, venue.city, venue.state, venue.zip].filter(Boolean).join(", ")}
          </p>
        </div>
      )}

      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-semibold">Guest List</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Guest list management coming soon.
        </p>
      </div>
    </>
  )
}
