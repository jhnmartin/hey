import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Event Detail",
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event Detail</h1>
        <Link
          href={`/dashboard/events/${id}/analytics`}
          className="bg-muted hover:bg-muted/80 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
        >
          View Analytics
        </Link>
      </div>
      <div className="bg-muted/50 rounded-xl p-6">
        <p className="text-muted-foreground text-sm">Event ID: {id}</p>
        <h2 className="mt-2 text-xl font-semibold">Thursday Night Live</h2>
        <p className="text-muted-foreground">The Grand Hall</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Date</p>
            <p className="font-medium">Feb 13, 2025</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Price</p>
            <p className="font-medium">$25</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">RSVPs</p>
            <p className="font-medium">234</p>
          </div>
        </div>
      </div>
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-semibold">Guest List</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Guest list management coming soon.
        </p>
      </div>
    </>
  )
}
