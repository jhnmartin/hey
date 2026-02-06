import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile",
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6 flex items-center gap-4">
        <div className="bg-muted flex size-16 items-center justify-center rounded-full text-xl font-bold">
          JS
        </div>
        <div>
          <p className="text-lg font-medium">Jordan Smith</p>
          <p className="text-muted-foreground text-sm">
            jordan@heythursday.app
          </p>
        </div>
      </div>
      <div className="bg-muted/50 mt-8 rounded-xl p-6">
        <h2 className="font-semibold">Upcoming Events</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          You have 2 upcoming events. Check your tickets for details.
        </p>
      </div>
      <div className="bg-muted/50 mt-4 rounded-xl p-6">
        <h2 className="font-semibold">Event History</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Past events will appear here.
        </p>
      </div>
    </div>
  )
}
