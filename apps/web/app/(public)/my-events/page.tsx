import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Events",
}

const tabs = ["Tickets", "RSVPs", "Bookmarked"] as const

const events = {
  Tickets: [
    { name: "Thursday Night Live", venue: "The Grand Hall", date: "Feb 13, 2025" },
    { name: "Rooftop Sunset Party", venue: "Sky Lounge", date: "Feb 14, 2025" },
  ],
  RSVPs: [
    { name: "Underground Beats", venue: "The Basement", date: "Feb 15, 2025" },
  ],
  Bookmarked: [
    { name: "Neon Nights Festival", venue: "Central Park Arena", date: "Feb 21, 2025" },
    { name: "Jazz & Wine Evening", venue: "Blue Note Club", date: "Feb 20, 2025" },
    { name: "Acoustic Sessions", venue: "The Library Bar", date: "Feb 22, 2025" },
  ],
}

export default function MyEventsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">My Events</h1>
      <div className="mt-4 flex gap-2">
        {tabs.map((tab) => (
          <div
            key={tab}
            className="bg-muted rounded-md px-3 py-1.5 text-sm font-medium"
          >
            {tab}
          </div>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab} className="mt-6">
          <h2 className="text-sm font-semibold">{tab}</h2>
          <div className="mt-2 space-y-2">
            {events[tab].map((event) => (
              <div
                key={event.name}
                className="bg-muted/50 flex items-center justify-between rounded-xl p-4"
              >
                <div>
                  <p className="font-medium">{event.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {event.venue}
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">
                  {event.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
