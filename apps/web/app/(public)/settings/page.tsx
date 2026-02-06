import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
}

export default function UserSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-6 space-y-4">
        <div className="bg-muted/50 rounded-xl p-6">
          <h2 className="font-semibold">Profile</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <div className="bg-background mt-1 flex h-10 items-center rounded-md border px-3 text-sm">
                Jordan Smith
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="bg-background mt-1 flex h-10 items-center rounded-md border px-3 text-sm">
                jordan@heythursday.app
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <h2 className="font-semibold">Notifications</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage how you receive event reminders and updates.
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <h2 className="font-semibold">Privacy</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Control your profile visibility and data preferences.
          </p>
        </div>
      </div>
    </div>
  )
}
