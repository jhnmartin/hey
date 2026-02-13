"use client"

import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useOrg } from "@/components/org-context"
import { SetPageTitle } from "@/components/page-title-context"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconBulb, IconChevronRight } from "@tabler/icons-react"
import {
  groupEventsByPhase,
  getPhaseContextLabel,
  PHASE_DISPLAY_ORDER,
  PHASE_INFO,
  MAINTENANCE_TIPS,
  type MarketingPhase,
} from "@/lib/marketing-phases"

export default function MarketingOverviewPage() {
  const { activeOrg } = useOrg()
  const events = useQuery(
    api.events.listByOrg,
    activeOrg ? { orgId: activeOrg._id } : "skip",
  )

  const now = Date.now()
  const phaseMap = events ? groupEventsByPhase(events, now) : null

  const activePhases: MarketingPhase[] = ["closeout", "announce", "on-sale", "planning"]
  const hasActiveEvents = phaseMap
    ? activePhases.some((p) => (phaseMap.get(p)?.length ?? 0) > 0)
    : false

  return (
    <>
      <SetPageTitle title="Marketing Overview" />
      <p className="text-muted-foreground text-sm">
        See where every event stands and what marketing actions to take next.
      </p>

      {!events ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted/50 h-24 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No events yet</CardTitle>
            <CardDescription>
              Create your first event to see marketing phases here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/events/new"
              className="text-primary text-sm underline"
            >
              Create an event
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {!hasActiveEvents && (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>
                  No active events right now. Focus on growing your audience and
                  planning ahead.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  {MAINTENANCE_TIPS.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="shrink-0">&#8226;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {PHASE_DISPLAY_ORDER.map((phase) => {
            const phaseEvents = phaseMap?.get(phase)
            if (!phaseEvents || phaseEvents.length === 0) return null
            const info = PHASE_INFO[phase]

            return (
              <div key={phase} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{info.label}</h2>
                  <Badge variant="secondary">{phaseEvents.length}</Badge>
                  <span className="text-muted-foreground text-sm">
                    {info.description}
                  </span>
                </div>

                <Collapsible>
                  <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors [&[data-state=open]>svg]:rotate-90">
                    <IconChevronRight className="size-4 transition-transform" />
                    <IconBulb className="size-4" />
                    Tips
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="text-muted-foreground mt-2 space-y-1 pl-9 text-sm">
                      {info.tips.map((tip) => (
                        <li key={tip} className="flex gap-2">
                          <span className="shrink-0">&#8226;</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

                <div className="bg-muted/50 rounded-xl">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Event Name</TableHead>
                        <TableHead className="w-[20%]">
                          {phase === "planning" ? "Created" : "Start Date"}
                        </TableHead>
                        <TableHead className="w-[25%]">Status</TableHead>
                        <TableHead className="w-[5%]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phaseEvents.map((event) => (
                        <TableRow key={event._id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/dashboard/events/${event._id}`}
                              className="hover:underline"
                            >
                              {event.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {phase === "planning"
                              ? new Date(event._creationTime).toLocaleDateString()
                              : event.startDate
                                ? new Date(event.startDate).toLocaleDateString()
                                : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {getPhaseContextLabel(event, phase, now)}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/events/${event._id}`}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <IconChevronRight className="size-4" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
