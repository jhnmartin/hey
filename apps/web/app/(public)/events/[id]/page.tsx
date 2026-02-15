"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { format } from "date-fns"
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCalendarCheck,
  IconCalendarPlus,
  IconCheck,
  IconExternalLink,
  IconMinus,
  IconPlus,
  IconTicket,
} from "@tabler/icons-react"
import { EventSignupDialog } from "@/components/event-signup-dialog"

type PendingAction = {
  type: "save" | "rsvp"
  eventId: string
}

export default function PublicEventDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
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
  const ticketTypes = useQuery(api.ticketTypes.listByEvent, params.id ? { eventId: params.id as any } : "skip")
  const toggleSave = useMutation(api.savedEvents.toggle)
  const toggleRsvp = useMutation(api.rsvps.toggle)
  const createCheckout = useAction(api.stripeCheckout.createCheckoutSession)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [checkingOut, setCheckingOut] = useState(false)

  const checkoutSuccess = searchParams.get("checkout") === "success"
  const sessionId = searchParams.get("session_id")
  const checkoutOrder = useQuery(
    api.orders.getBySessionId,
    checkoutSuccess && sessionId ? { stripeSessionId: sessionId } : "skip",
  )

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

          {/* Checkout success banner */}
          {checkoutSuccess && (
            <div className="bg-green-600/10 mt-4 flex items-center gap-2 rounded-lg p-4">
              <IconCheck className="size-5 text-green-500" />
              <p className="text-sm font-medium text-green-500">
                {checkoutOrder?.status === "completed"
                  ? "Tickets confirmed! Check your Passport."
                  : "Payment received — confirming your tickets..."}
              </p>
            </div>
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
              className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium ${event.isFreeEvent || event.ticketingMode === "none" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
            >
              {isRsvpd ? (
                <IconCalendarCheck className="size-4" />
              ) : (
                <IconCalendarPlus className="size-4" />
              )}
              {isRsvpd ? "Going" : "RSVP"}
            </button>
          </div>

          {/* Ticketing */}
          {event.ticketingMode === "platform" && ticketTypes && ticketTypes.filter(tt => tt.status === "active").length > 0 && (
            <div className="mt-4 space-y-3">
              {ticketTypes
                .filter(tt => tt.status === "active")
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((tt) => {
                  const available = tt.quantity - tt.sold
                  const qty = quantities[tt._id] ?? 0
                  return (
                    <div key={tt._id} className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
                      <div>
                        <p className="font-medium">{tt.name}</p>
                        <p className="text-muted-foreground text-sm">
                          ${(tt.price / 100).toFixed(2)}
                          {available <= 10 && available > 0 && (
                            <span className="ml-2 text-orange-500">{available} left</span>
                          )}
                          {available === 0 && (
                            <span className="ml-2 text-red-500">Sold out</span>
                          )}
                        </p>
                      </div>
                      {available > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuantities(prev => ({ ...prev, [tt._id]: Math.max(0, qty - 1) }))}
                            disabled={qty === 0}
                            className="bg-background hover:bg-background/80 inline-flex size-8 items-center justify-center rounded-md border disabled:opacity-50"
                          >
                            <IconMinus className="size-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setQuantities(prev => ({ ...prev, [tt._id]: Math.min(available, qty + 1) }))}
                            disabled={qty >= available}
                            className="bg-background hover:bg-background/80 inline-flex size-8 items-center justify-center rounded-md border disabled:opacity-50"
                          >
                            <IconPlus className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              {Object.values(quantities).some(q => q > 0) && (
                <button
                  type="button"
                  disabled={checkingOut}
                  onClick={async () => {
                    if (!isSignedIn) {
                      setPendingAction({ type: "save", eventId: event._id })
                      setDialogOpen(true)
                      return
                    }
                    setCheckingOut(true)
                    try {
                      const items = Object.entries(quantities)
                        .filter(([, q]) => q > 0)
                        .map(([ticketTypeId, quantity]) => ({
                          ticketTypeId: ticketTypeId as any,
                          quantity,
                        }))
                      const result = await createCheckout({
                        eventId: event._id as any,
                        items,
                        successUrl: window.location.href.split("?")[0]!,
                        cancelUrl: window.location.href.split("?")[0]!,
                      })
                      if (result.url) {
                        window.location.href = result.url
                      }
                    } catch (error) {
                      console.error("Checkout failed:", error)
                      setCheckingOut(false)
                    }
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 text-xl font-medium uppercase disabled:opacity-50"
                >
                  <IconTicket className="size-5" />
                  {checkingOut ? "Redirecting..." : "Buy Tickets"}
                </button>
              )}
            </div>
          )}

          {event.ticketingMode === "external" && event.externalTicketUrl && (
            <a
              href={event.externalTicketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-xl font-medium uppercase"
            >
              <IconExternalLink className="size-5" />
              Get Tickets
            </a>
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
