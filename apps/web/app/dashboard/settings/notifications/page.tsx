import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notification Preferences",
}

const preferences = [
  {
    label: "New RSVPs",
    description: "Get notified when someone RSVPs to your event.",
  },
  {
    label: "Ticket Sales",
    description: "Get notified when a ticket is purchased.",
  },
  {
    label: "Event Reminders",
    description: "Receive reminders before your events start.",
  },
  {
    label: "Team Activity",
    description: "Get notified about team member actions.",
  },
]

export default function NotificationSettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="bg-muted/50 max-w-2xl rounded-xl">
        {preferences.map((pref) => (
          <div
            key={pref.label}
            className="flex items-center justify-between border-b p-4 last:border-b-0"
          >
            <div>
              <p className="font-medium">{pref.label}</p>
              <p className="text-muted-foreground text-sm">
                {pref.description}
              </p>
            </div>
            <div className="bg-muted h-5 w-9 rounded-full" />
          </div>
        ))}
      </div>
    </>
  )
}
