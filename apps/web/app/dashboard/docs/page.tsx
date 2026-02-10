import type { Metadata } from "next"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "Documentation",
}

const sections = [
  {
    title: "Getting Started",
    description: "Learn the basics of creating and managing events.",
  },
  {
    title: "Event Management",
    description: "Deep dive into event setup, tickets, and guest lists.",
  },
  {
    title: "Analytics & Reporting",
    description: "Understand your event performance and audience.",
  },
  {
    title: "Team & Permissions",
    description: "Manage your team roles and access controls.",
  },
  {
    title: "Billing & Plans",
    description: "Plan details, upgrades, and payment information.",
  },
  {
    title: "API Reference",
    description: "Integrate hey thursday into your workflow.",
  },
]

export default function DocsPage() {
  return (
    <>
      <SetPageTitle title="Documentation" />
      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-muted/50 hover:bg-muted/80 cursor-pointer rounded-xl p-6 transition-colors"
          >
            <h3 className="font-semibold">{section.title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {section.description}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
