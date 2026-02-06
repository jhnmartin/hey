import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Event",
}

export default function CreateEventPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Create Event</h1>
      <div className="bg-muted/50 max-w-2xl rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Event Name</label>
            <div className="bg-background mt-1 h-10 rounded-md border" />
          </div>
          <div>
            <label className="text-sm font-medium">Venue</label>
            <div className="bg-background mt-1 h-10 rounded-md border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <div className="bg-background mt-1 h-10 rounded-md border" />
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <div className="bg-background mt-1 h-10 rounded-md border" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Ticket Price</label>
            <div className="bg-background mt-1 h-10 rounded-md border" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <div className="bg-background mt-1 h-24 rounded-md border" />
          </div>
          <div className="bg-primary text-primary-foreground inline-flex cursor-not-allowed items-center rounded-md px-4 py-2 text-sm font-medium opacity-50">
            Create Event
          </div>
        </div>
      </div>
    </>
  )
}
