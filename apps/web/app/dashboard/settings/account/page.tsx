import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account Settings",
}

export default function AccountSettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Account</h1>
      <div className="bg-muted/50 max-w-2xl rounded-xl p-6">
        <div className="space-y-4">
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
          <div>
            <label className="text-sm font-medium">Organization</label>
            <div className="bg-background mt-1 flex h-10 items-center rounded-md border px-3 text-sm">
              hey thursday
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
