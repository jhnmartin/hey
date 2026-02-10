import type { Metadata } from "next"
import Link from "next/link"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "Event Dashboard",
}

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <SetPageTitle title="Event Dashboard" />
      <p className="text-muted-foreground text-sm">Event ID: {id}</p>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Tickets Sold</p>
          <p className="text-3xl font-bold">187</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">RSVPs</p>
          <p className="text-3xl font-bold">234</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Revenue</p>
          <p className="text-3xl font-bold">$4,675</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Check-ins</p>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-muted/50 rounded-xl p-6">
          <h2 className="font-semibold">Quick Actions</h2>
          <div className="mt-3 space-y-2">
            <Link
              href={`/dashboard/events/${id}`}
              className="bg-background block rounded-lg border p-3 text-sm hover:bg-muted/80"
            >
              Edit Event Details
            </Link>
            <Link
              href={`/dashboard/events/${id}/analytics`}
              className="bg-background block rounded-lg border p-3 text-sm hover:bg-muted/80"
            >
              View Analytics
            </Link>
            <Link
              href={`/dashboard/events/${id}/preview`}
              className="bg-background block rounded-lg border p-3 text-sm hover:bg-muted/80"
            >
              Preview Public Page
            </Link>
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <h2 className="font-semibold">Recent Activity</h2>
          <div className="text-muted-foreground mt-3 space-y-2 text-sm">
            <p>Ticket purchased by Alex R. — 5 min ago</p>
            <p>New RSVP from Sam C. — 20 min ago</p>
            <p>Event details updated — 1 hour ago</p>
          </div>
        </div>
      </div>
    </>
  )
}
