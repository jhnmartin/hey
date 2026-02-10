import type { Metadata } from "next"
import Link from "next/link"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "Settings",
}

const sections = [
  {
    title: "Account",
    description: "Manage your account details and profile information.",
    href: "/dashboard/settings/account",
  },
  {
    title: "Billing",
    description: "View your plan, payment methods, and invoices.",
    href: "/dashboard/settings/billing",
  },
  {
    title: "Notifications",
    description: "Configure how and when you receive notifications.",
    href: "/dashboard/settings/notifications",
  },
]

export default function SettingsPage() {
  return (
    <>
      <SetPageTitle title="Settings" />
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-muted/50 hover:bg-muted/80 rounded-xl p-6 transition-colors"
          >
            <h3 className="font-semibold">{section.title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  )
}
