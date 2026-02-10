import type { Metadata } from "next"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "Event Analytics",
}

export default async function EventAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <SetPageTitle title="Event Analytics" />
      <p className="text-muted-foreground text-sm">Event ID: {id}</p>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Page Views</p>
          <p className="text-3xl font-bold">1,234</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Unique Visitors</p>
          <p className="text-3xl font-bold">892</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">RSVPs</p>
          <p className="text-3xl font-bold">234</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Conversion</p>
          <p className="text-3xl font-bold">26%</p>
        </div>
      </div>
      <div className="bg-muted/50 min-h-[30vh] rounded-xl p-6">
        <h2 className="font-semibold">Traffic Over Time</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Chart placeholder — analytics visualization coming soon.
        </p>
      </div>
    </>
  )
}
