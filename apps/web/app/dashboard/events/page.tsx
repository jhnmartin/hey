"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useOrg } from "@/components/org-context"
import { SetPageTitle } from "@/components/page-title-context"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconLayoutGrid, IconList } from "@tabler/icons-react"

type View = "card" | "list"

export default function EventsPage() {
  const { activeOrg } = useOrg()
  const [view, setView] = useState<View>("card")
  const events = useQuery(
    api.events.listByOrg,
    activeOrg ? { orgId: activeOrg._id } : "skip",
  )

  return (
    <>
      <SetPageTitle title="Events" />
      <div className="flex items-center justify-between">
        <div className="bg-muted inline-flex items-center rounded-md p-0.5">
          <button
            onClick={() => setView("card")}
            className={`inline-flex items-center rounded-sm px-2 py-1.5 text-sm font-medium transition-colors ${
              view === "card"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IconLayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`inline-flex items-center rounded-sm px-2 py-1.5 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IconList className="size-4" />
          </button>
        </div>
        <Link
          href="/dashboard/events/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
        >
          Create Event
        </Link>
      </div>

      {!events ? (
        view === "card" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-muted/50 h-40 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="bg-muted/50 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12" />
                  <TableHead>Name</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <div className="bg-muted h-8 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
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
      ) : view === "card" ? (
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
      ) : (
        <div className="bg-muted/50 rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Name</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow
                  key={event._id}
                  className="cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/events/${event._id}`}
                >
                  <TableCell>
                    {event.coverImageUrl ? (
                      <img
                        src={event.coverImageUrl}
                        alt=""
                        className="size-8 rounded object-cover"
                      />
                    ) : (
                      <div className="bg-muted size-8 rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {event.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.venues && event.venues.length > 0
                      ? event.venues[0]!.name
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.status === "published" ? "default" : "secondary"
                      }
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
