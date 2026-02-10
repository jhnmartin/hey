"use client"

import { useOrg } from "@/components/org-context"
import { SetPageTitle } from "@/components/page-title-context"

const orgStats: Record<string, { events: number; rsvps: number; revenue: string }> = {
  "hey thursday": { events: 3, rsvps: 890, revenue: "$4,250" },
  "Neon Events Co": { events: 3, rsvps: 435, revenue: "$2,100" },
}

const orgActivity: Record<string, string[]> = {
  "hey thursday": [
    'New RSVP for "Thursday Night Live" — 2 minutes ago',
    '"Rooftop Sunset Party" ticket sold — 15 minutes ago',
    '"Underground Beats" event published — 1 hour ago',
    "New team member added — 3 hours ago",
  ],
  "Neon Events Co": [
    '"Neon Nights Festival" ticket sold — 5 minutes ago',
    'New RSVP for "Jazz & Wine Evening" — 30 minutes ago',
    '"Acoustic Sessions" event published — 2 hours ago',
    "Venue confirmed for Neon Nights — 4 hours ago",
  ],
}

export default function DashboardPage() {
  const { activeOrg } = useOrg()
  const stats = (activeOrg ? orgStats[activeOrg.name] : null) ?? orgStats["hey thursday"]!
  const activity = (activeOrg ? orgActivity[activeOrg.name] : null) ?? orgActivity["hey thursday"]!

  return (
    <>
      <SetPageTitle title="Dashboard" />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm font-medium">
            Total Events
          </p>
          <p className="text-3xl font-bold">{stats.events}</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm font-medium">
            Total RSVPs
          </p>
          <p className="text-3xl font-bold">{stats.rsvps.toLocaleString()}</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm font-medium">Revenue</p>
          <p className="text-3xl font-bold">{stats.revenue}</p>
        </div>
      </div>
      <div className="bg-muted/50 min-h-[50vh] flex-1 rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="text-muted-foreground space-y-3 text-sm">
          {activity.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
    </>
  )
}
