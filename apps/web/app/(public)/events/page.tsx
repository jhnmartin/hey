"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCalendarCheck,
  IconCalendarPlus,
} from "@tabler/icons-react"
import { EventSignupDialog } from "@/components/event-signup-dialog"
import { LocationBar } from "@/components/location-bar"
import { useLocation } from "@/lib/location-context"

type PendingAction = {
  type: "save" | "rsvp"
  eventId: string
}

export default function BrowseEventsPage() {
  const { isSignedIn } = useAuth()
  const { location } = useLocation()

  const hasLocation = location.lat != null && location.lng != null
  const nearbyEvents = useQuery(
    api.events.listNearby,
    hasLocation
      ? { lat: location.lat!, lng: location.lng!, radiusMiles: location.radiusMiles }
      : "skip",
  )
  const allEvents = useQuery(
    api.events.listPublic,
    hasLocation ? "skip" : {},
  )
  const events = hasLocation ? nearbyEvents : allEvents

  const savedEventIds = useQuery(
    api.savedEvents.listByProfile,
    isSignedIn ? {} : "skip",
  )
  const rsvpEventIds = useQuery(
    api.rsvps.listByProfile,
    isSignedIn ? {} : "skip",
  )
  const toggleSave = useMutation(api.savedEvents.toggle)
  const toggleRsvp = useMutation(api.rsvps.toggle)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  // Handle pending action from social OAuth redirect
  useEffect(() => {
    if (!isSignedIn) return
    const stored = localStorage.getItem("pendingEventAction")
    if (!stored) return
    localStorage.removeItem("pendingEventAction")
    try {
      const action = JSON.parse(stored) as PendingAction
      if (action.type === "save") {
        toggleSave({ eventId: action.eventId as any })
      } else {
        toggleRsvp({ eventId: action.eventId as any })
      }
    } catch {
      // ignore malformed data
    }
  }, [isSignedIn])

  function handleAction(type: "save" | "rsvp", eventId: string) {
    if (isSignedIn) {
      if (type === "save") {
        toggleSave({ eventId: eventId as any })
      } else {
        toggleRsvp({ eventId: eventId as any })
      }
    } else {
      setPendingAction({ type, eventId })
      setDialogOpen(true)
    }
  }

  const savedSet = new Set(savedEventIds ?? [])
  const rsvpSet = new Set(rsvpEventIds ?? [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Browse Events</h1>
        <LocationBar />
      </div>

      {events === undefined ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted/50 h-64 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-muted/50 mt-6 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            {hasLocation
              ? "No events found within this radius."
              : "No events to show right now."}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasLocation
              ? "Try increasing the radius or searching a different area."
              : "Check back soon for upcoming events."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => {
            const isSaved = savedSet.has(event._id)
            const isRsvpd = rsvpSet.has(event._id)
            const distanceMiles = "distanceMiles" in event ? (event as any).distanceMiles as number : null

            return (
              <div
                key={event._id}
                className="bg-muted/50 hover:bg-muted/80 overflow-hidden rounded-xl transition-colors"
              >
                <Link href={`/events/${event._id}`}>
                  {event.coverImageUrl ? (
                    <img
                      src={event.coverImageUrl}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="bg-muted aspect-square w-full" />
                  )}
                </Link>
                <div className="p-3">
                  <Link href={`/events/${event._id}`} className="block">
                    <h3 className="text-sm font-semibold">{event.name}</h3>
                    {event.venues && event.venues.length > 0 && (
                      <p className="text-muted-foreground text-xs">
                        {event.venues[0]!.name}
                        {distanceMiles != null && (
                          <span> · {distanceMiles} mi</span>
                        )}
                      </p>
                    )}
                  </Link>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "\u00A0"}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleAction("save", event._id)}
                        className={`rounded-full p-1 transition-colors ${isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {isSaved ? (
                          <IconBookmarkFilled className="size-4" />
                        ) : (
                          <IconBookmark className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("rsvp", event._id)}
                        className={`rounded-full p-1 transition-colors ${isRsvpd ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {isRsvpd ? (
                          <IconCalendarCheck className="size-4" />
                        ) : (
                          <IconCalendarPlus className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <EventSignupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pendingAction={pendingAction}
      />
    </div>
  )
}
