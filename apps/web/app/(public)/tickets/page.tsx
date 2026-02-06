import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Tickets",
}

const tickets = [
  {
    id: "t1",
    event: "Thursday Night Live",
    venue: "The Grand Hall",
    date: "Feb 13, 2025",
    status: "Confirmed",
  },
  {
    id: "t2",
    event: "Rooftop Sunset Party",
    venue: "Sky Lounge",
    date: "Feb 14, 2025",
    status: "Confirmed",
  },
]

export default function TicketsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">My Tickets</h1>
      <div className="mt-6 space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-muted/50 flex items-center justify-between rounded-xl p-6"
          >
            <div>
              <h3 className="font-semibold">{ticket.event}</h3>
              <p className="text-muted-foreground text-sm">{ticket.venue}</p>
              <p className="text-muted-foreground text-sm">{ticket.date}</p>
            </div>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
              {ticket.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
