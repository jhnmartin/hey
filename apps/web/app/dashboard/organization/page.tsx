import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Organization Settings",
}

const tabs = [
  { label: "General", description: "Organization name, logo, and details." },
  { label: "Members", description: "Manage team members and roles." },
  { label: "Billing", description: "Plan, payment methods, and invoices." },
  { label: "Notifications", description: "Configure organization-wide notification preferences." },
]

export default function OrganizationSettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Organization Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {tabs.map((tab) => (
          <div
            key={tab.label}
            className="bg-muted/50 rounded-xl p-6"
          >
            <h3 className="font-semibold">{tab.label}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {tab.description}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
