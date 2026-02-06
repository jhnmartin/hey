import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Event Detail",
}

export default async function PublicEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="bg-muted mb-6 aspect-video rounded-xl" />
      <h1 className="text-3xl font-bold">Thursday Night Live</h1>
      <p className="text-muted-foreground mt-1">The Grand Hall</p>
      <p className="text-muted-foreground text-sm">Event ID: {id}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-muted-foreground text-sm">Date</p>
          <p className="font-medium">Feb 13, 2025</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-muted-foreground text-sm">Time</p>
          <p className="font-medium">8:00 PM</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-muted-foreground text-sm">Price</p>
          <p className="font-medium">$25</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold">About This Event</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Join us for an unforgettable Thursday night featuring live
          performances, great drinks, and an amazing atmosphere. This is the
          place to be every Thursday.
        </p>
      </div>
      <div className="mt-8 flex gap-4">
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-not-allowed items-center rounded-md px-6 py-3 text-sm font-medium opacity-50">
          Get Tickets — $25
        </button>
        <button className="bg-muted hover:bg-muted/80 inline-flex cursor-not-allowed items-center rounded-md px-6 py-3 text-sm font-medium opacity-50">
          RSVP
        </button>
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        234 people going
      </p>
    </div>
  )
}
