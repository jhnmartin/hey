"use client"

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
import { computeMarketingPhase, PHASE_INFO } from "@/lib/marketing-phases"

export default function GetRadicalPage() {
  const { activeOrg } = useOrg()
  const events = useQuery(
    api.events.listByOrg,
    activeOrg ? { orgId: activeOrg._id } : "skip",
  )

  return (
    <>
      <SetPageTitle title="get radical" />

      <div className="bg-primary text-primary-foreground rounded-xl p-6">
        <h2 className="text-lg font-semibold">Powered by Radical Marketing</h2>
        <p className="mt-2 text-sm opacity-90">
          We&apos;ve partnered with Radical Marketing to give you direct access
          to professional ad campaigns, audience targeting, and analytics that
          drive real ticket sales. This integration is offered at no extra cost
          through hey thursday — you only pay Radical&apos;s standard service
          fees for the campaigns you run.
        </p>
        <a
          href="https://itsradical.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 mt-4 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          its radical
        </a>
      </div>

      <h2 className="text-lg font-semibold">Events</h2>

      {!events ? (
        <div className="bg-muted/50 rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <div className="bg-muted h-8 animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        <div className="border-border overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const phase = computeMarketingPhase(event)
                return (
                  <TableRow key={event._id} className="bg-card border-border">
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/marketing/get-radical/${event._id}`}
                        className="underline"
                      >
                        {event.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {phase ? PHASE_INFO[phase].label : "—"}
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
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
