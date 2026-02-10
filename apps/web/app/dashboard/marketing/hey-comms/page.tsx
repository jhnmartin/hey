import type { Metadata } from "next"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "hey comms",
}

const channels = [
  {
    name: "SMS",
    description: "Send targeted text blasts to your RSVP lists and followers.",
    status: "Active",
  },
  {
    name: "Email",
    description:
      "Design and send event announcements, reminders, and follow-ups.",
    status: "Active",
  },
  {
    name: "Push Notifications",
    description:
      "Reach attendees instantly through the hey thursday app.",
    status: "Active",
  },
  {
    name: "Power Boosts",
    description:
      "Add your event to hey thursday's featured placements, curated lists, and pay-to-play promotional spots.",
    status: "Available",
  },
]

export default function HeyCommsPage() {
  return (
    <>
      <SetPageTitle title="hey comms" />
      <p className="text-muted-foreground text-sm">
        Reach your audience through SMS, email, push notifications, and
        hey thursday&apos;s native promotional channels.
      </p>
      <div className="grid max-w-3xl gap-4">
        {channels.map((channel) => (
          <div
            key={channel.name}
            className="bg-muted/50 flex items-center justify-between rounded-xl p-6"
          >
            <div>
              <h3 className="font-semibold">{channel.name}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {channel.description}
              </p>
            </div>
            <span className="bg-primary/10 text-primary shrink-0 rounded-full px-3 py-1 text-xs font-medium">
              {channel.status}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
