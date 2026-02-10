"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"

const tabs = ["RSVPs", "Saved"] as const
type Tab = (typeof tabs)[number]

export default function MyEventsPage() {
  const { isSignedIn } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("RSVPs")

  const rsvpIds = useQuery(
    api.rsvps.listByProfile,
    isSignedIn ? {} : "skip",
  )
  const savedIds = useQuery(
    api.savedEvents.listByProfile,
    isSignedIn ? {} : "skip",
  )

  const activeIds = activeTab === "RSVPs" ? rsvpIds : savedIds

  const events = useQuery(
    api.events.listByIds,
    activeIds && activeIds.length > 0 ? { ids: activeIds } : "skip",
  )

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">My Events</h1>
        <div className="bg-muted/50 mt-6 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            <Link href="/login" className="text-foreground underline">Log in</Link> to see your events.
          </p>
        </div>
      </div>
    )
  }

  const loading = activeIds === undefined || (activeIds.length > 0 && events === undefined)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">My Events</h1>
      <div className="mt-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-muted/50 h-20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : !activeIds || activeIds.length === 0 ? (
          <div className="bg-muted/50 rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              {activeTab === "RSVPs"
                ? "No RSVPs yet. Browse events and mark the ones you're going to."
                : "No saved events yet. Bookmark events you're interested in."}
            </p>
            <Link
              href="/events"
              className="text-primary mt-2 inline-block text-sm underline underline-offset-4"
            >
              Browse events
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {(events ?? []).map((event) => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="bg-muted/50 hover:bg-muted/80 flex items-center justify-between rounded-xl p-4 transition-colors"
              >
                <div>
                  <p className="font-medium">{event.name}</p>
                  {event.venues && event.venues.length > 0 && (
                    <p className="text-muted-foreground text-sm">
                      {event.venues[0]!.name}
                    </p>
                  )}
                </div>
                {event.startDate && (
                  <span className="text-muted-foreground shrink-0 text-sm">
                    {new Date(event.startDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
