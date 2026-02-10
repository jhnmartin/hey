import type { Metadata } from "next"
import Link from "next/link"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "Event Preview",
}

export default async function EventPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <SetPageTitle title="Preview" />
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Link
            href={`/dashboard/events/${id}`}
            className="bg-muted hover:bg-muted/80 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
          >
            Back to Edit
          </Link>
          <Link
            href={`/events/${id}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
          >
            View Live Page
          </Link>
        </div>
      </div>
      <div className="bg-muted/50 mx-auto max-w-3xl rounded-xl p-8">
        <p className="text-muted-foreground mb-4 text-center text-xs uppercase tracking-wide">
          Public page preview
        </p>
        <div className="bg-muted mb-6 aspect-video rounded-xl" />
        <h2 className="text-3xl font-bold">Thursday Night Live</h2>
        <p className="text-muted-foreground mt-1">The Grand Hall</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Date</p>
            <p className="font-medium">Feb 13, 2025</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Time</p>
            <p className="font-medium">8:00 PM</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Price</p>
            <p className="font-medium">$25</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold">About This Event</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Join us for an unforgettable Thursday night featuring live
            performances, great drinks, and an amazing atmosphere.
          </p>
        </div>
        <div className="mt-8 flex gap-4">
          <div className="bg-primary text-primary-foreground inline-flex items-center rounded-md px-6 py-3 text-sm font-medium opacity-50">
            Get Tickets — $25
          </div>
          <div className="bg-muted inline-flex items-center rounded-md px-6 py-3 text-sm font-medium opacity-50">
            RSVP
          </div>
        </div>
      </div>
    </>
  )
}
