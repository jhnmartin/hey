import type { Metadata } from "next"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "get radical",
}

const automations = [
  {
    name: "Early Bird Drip",
    description:
      "Automated email sequence that nurtures early ticket buyers into ambassadors.",
    status: "Template",
  },
  {
    name: "Last-Chance Countdown",
    description:
      "SMS + email countdown triggered 48 hours before your event sells out.",
    status: "Template",
  },
  {
    name: "Post-Event Re-engage",
    description:
      "Follow up with attendees after the event with photos, surveys, and next-event promos.",
    status: "Template",
  },
  {
    name: "Social Retargeting",
    description:
      "Sync your RSVP lists to ad platforms for lookalike and retargeting campaigns.",
    status: "Coming Soon",
  },
]

export default function GetRadicalPage() {
  return (
    <>
      <SetPageTitle title="get radical" />
      <p className="text-muted-foreground text-sm">
        Paid marketing automations powered by our partner platform.
        Launch pre-built campaigns or create your own.
      </p>
      <div className="grid max-w-3xl gap-4">
        {automations.map((auto) => (
          <div
            key={auto.name}
            className="bg-muted/50 flex items-center justify-between rounded-xl p-6"
          >
            <div>
              <h3 className="font-semibold">{auto.name}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {auto.description}
              </p>
            </div>
            <span className="bg-muted shrink-0 rounded-full px-3 py-1 text-xs font-medium">
              {auto.status}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
