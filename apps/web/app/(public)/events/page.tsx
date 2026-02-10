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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type PendingAction = {
  type: "save" | "rsvp"
  eventId: string
}

export default function BrowseEventsPage() {
  const { isSignedIn } = useAuth()
  const events = useQuery(api.events.listPublic)
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
          {events.map((event) => {
            const isSaved = savedSet.has(event._id)
            const isRsvpd = rsvpSet.has(event._id)

            return (
              <div
                key={event._id}
                className="bg-muted/50 hover:bg-muted/80 overflow-hidden rounded-xl transition-colors"
              >
                <div className="relative">
                  <Link href={`/events/${event._id}`}>
                    {event.coverImageUrl ? (
                      <img
                        src={event.coverImageUrl}
                        alt=""
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted aspect-video w-full" />
                    )}
                  </Link>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleAction("save", event._id)}
                            className="cursor-pointer rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                          >
                            {isSaved ? (
                              <IconBookmarkFilled className="size-4" />
                            ) : (
                              <IconBookmark className="size-4" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Save event</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleAction("rsvp", event._id)}
                            className="cursor-pointer rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                          >
                            {isRsvpd ? (
                              <IconCalendarCheck className="size-4" />
                            ) : (
                              <IconCalendarPlus className="size-4" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Going</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Link href={`/events/${event._id}`} className="block p-4">
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
                </Link>
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
