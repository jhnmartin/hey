import type { Metadata } from "next"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "Analytics",
}

export default function AnalyticsPage() {
  return (
    <>
      <SetPageTitle title="Analytics" />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Total Events</p>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Total RSVPs</p>
          <p className="text-3xl font-bold">1,325</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Total Revenue</p>
          <p className="text-3xl font-bold">$12,450</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Avg. Attendance</p>
          <p className="text-3xl font-bold">110</p>
        </div>
      </div>
      <div className="bg-muted/50 min-h-[40vh] rounded-xl p-6">
        <h2 className="font-semibold">Revenue Over Time</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Chart placeholder — analytics dashboard coming soon.
        </p>
      </div>
    </>
  )
}
