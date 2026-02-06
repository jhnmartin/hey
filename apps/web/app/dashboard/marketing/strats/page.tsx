import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Strats",
}

const playbooks = [
  {
    name: "Club Night Launch",
    description:
      "Step-by-step advertising playbook for weekly club nights and recurring DJ events.",
    tactics: 8,
  },
  {
    name: "Festival Hype Cycle",
    description:
      "Multi-phase campaign strategy from early announcement through day-of coverage.",
    tactics: 12,
  },
  {
    name: "Intimate Venue Sell-Out",
    description:
      "Focused approach for small-capacity events that need to sell out fast.",
    tactics: 6,
  },
  {
    name: "Rooftop / Day Party",
    description:
      "Visual-first marketing strategy built around lifestyle content and influencer partnerships.",
    tactics: 9,
  },
  {
    name: "Corporate / Private Event",
    description:
      "B2B outreach and LinkedIn-focused playbook for corporate bookings.",
    tactics: 7,
  },
  {
    name: "Free Community Event",
    description:
      "Maximize RSVPs and attendance for free events through organic and low-cost channels.",
    tactics: 5,
  },
]

export default function StratsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Strats</h1>
      <p className="text-muted-foreground text-sm">
        Ready-made advertising playbooks for common event types. Pick a
        strategy, customize it, and launch.
      </p>
      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        {playbooks.map((playbook) => (
          <div
            key={playbook.name}
            className="bg-muted/50 hover:bg-muted/80 cursor-pointer rounded-xl p-6 transition-colors"
          >
            <h3 className="font-semibold">{playbook.name}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {playbook.description}
            </p>
            <p className="text-muted-foreground mt-3 text-xs">
              {playbook.tactics} tactics
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
