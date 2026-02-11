"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { format } from "date-fns"
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCalendarCheck,
  IconCalendarPlus,
  IconTicket,
} from "@tabler/icons-react"
import { EventSignupDialog } from "@/components/event-signup-dialog"

type PendingAction = {
  type: "save" | "rsvp"
  eventId: string
}

export default function PublicEventDetailPage() {
  const params = useParams<{ id: string }>()
  const { isSignedIn } = useAuth()

  const event = useQuery(api.events.get, { id: params.id as any })
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

  function handleAction(type: "save" | "rsvp") {
    if (!event) return
    if (isSignedIn) {
      if (type === "save") {
        toggleSave({ eventId: event._id as any })
      } else {
        toggleRsvp({ eventId: event._id as any })
      }
    } else {
      setPendingAction({ type, eventId: event._id })
      setDialogOpen(true)
    }
  }

  const savedSet = new Set(savedEventIds ?? [])
  const rsvpSet = new Set(rsvpEventIds ?? [])

  // Loading state
  if (event === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="bg-muted aspect-square w-full animate-pulse rounded-xl" />
          <div>
            <div className="bg-muted h-8 w-2/3 animate-pulse rounded" />
            <div className="bg-muted mt-2 h-5 w-1/3 animate-pulse rounded" />
            <div className="bg-muted mt-6 h-20 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Not found
  if (event === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <p className="text-muted-foreground mt-2">
          This event doesn&apos;t exist or may have been removed.
        </p>
      </div>
    )
  }

  const isSaved = savedSet.has(event._id)
  const isRsvpd = rsvpSet.has(event._id)
  const primaryVenue = event.venues?.find((v) => v.primary) ?? event.venues?.[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left column — cover image + actions */}
        <div>
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt=""
              className="aspect-square w-full rounded-xl object-cover"
            />
          ) : (
            <div className="bg-muted aspect-square w-full rounded-xl" />
          )}

          {/* Save / RSVP buttons */}
          <div className="mt-4 flex gap-4">
            <button
              type="button"
              onClick={() => handleAction("save")}
              className="bg-muted hover:bg-muted/80 inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium"
            >
              {isSaved ? (
                <IconBookmarkFilled className="size-4" />
              ) : (
                <IconBookmark className="size-4" />
              )}
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => handleAction("rsvp")}
              className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium ${event.isFreeEvent ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
            >
              {isRsvpd ? (
                <IconCalendarCheck className="size-4" />
              ) : (
                <IconCalendarPlus className="size-4" />
              )}
              {isRsvpd ? "Going" : "RSVP"}
            </button>
          </div>
          {!event.isFreeEvent && (
            <button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 text-xl font-medium uppercase"
            >
              <IconTicket className="size-4" />
              Get Tickets
            </button>
          )}
        </div>

        {/* Right column — event details */}
        <div>
          {/* Title & venue */}
          <h1 className="text-3xl font-bold">{event.name}</h1>
          {event.tagline && (
            <p className="text-muted-foreground mt-1">{event.tagline}</p>
          )}
          {primaryVenue && (
            <p className="text-muted-foreground mt-1">
              {primaryVenue.name}
              {primaryVenue.address && ` · ${primaryVenue.address}`}
              {primaryVenue.city && `, ${primaryVenue.city}`}
              {primaryVenue.state && `, ${primaryVenue.state}`}
            </p>
          )}

          {/* Date & Time */}
          <div className="bg-muted/50 mt-6 rounded-lg p-4">
            <p className="text-lg font-bold">
              {event.startDate
                ? format(new Date(event.startDate), "EEEE, MMMM d, yyyy")
                : "TBA"}
            </p>
            <div className="mt-2 flex gap-4">
              {event.doorsOpen && (
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">Doors</p>
                  <p className="font-medium">
                    {format(new Date(event.doorsOpen), "h:mm a")}
                  </p>
                </div>
              )}
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">Start</p>
                <p className="font-medium">
                  {event.startDate
                    ? format(new Date(event.startDate), "h:mm a")
                    : "TBA"}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">End</p>
                <p className="font-medium">
                  {event.endDate
                    ? format(new Date(event.endDate), "h:mm a")
                    : "TBA"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Event Details</h2>
            {event.richDescription ? (
              <div
                className="text-muted-foreground prose-sm mt-2"
                dangerouslySetInnerHTML={{ __html: event.richDescription }}
              />
            ) : event.description ? (
              <p className="text-muted-foreground mt-2 text-sm">
                {event.description}
              </p>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">
                No description provided.
              </p>
            )}
          </div>

          {/* Metadata badges */}
          {(event.ageRestriction !== "all_ages" || (event.tags && event.tags.length > 0)) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {event.ageRestriction === "18_plus" && (
                <span className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
                  18+
                </span>
              )}
              {event.ageRestriction === "21_plus" && (
                <span className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
                  21+
                </span>
              )}
              {event.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-muted rounded-full px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <EventSignupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pendingAction={pendingAction}
      />
    </div>
  )
}
