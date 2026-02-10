"use client"

export function SettingsContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Preferences</h1>
      <div className="mt-6 space-y-4">
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
