import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support",
}

export default function SupportPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Support</h1>
      <div className="bg-muted/50 max-w-2xl rounded-xl p-6">
        <h2 className="font-semibold">How can we help?</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Our support team is here to help you get the most out of hey
          thursday.
        </p>
        <div className="mt-6 space-y-3">
          <div className="bg-background rounded-lg border p-4">
            <p className="font-medium">Email Support</p>
            <p className="text-muted-foreground text-sm">
              support@heythursday.app
            </p>
          </div>
          <div className="bg-background rounded-lg border p-4">
            <p className="font-medium">Live Chat</p>
            <p className="text-muted-foreground text-sm">
              Available Mon–Fri, 9am–6pm ET
            </p>
          </div>
          <div className="bg-background rounded-lg border p-4">
            <p className="font-medium">Community</p>
            <p className="text-muted-foreground text-sm">
              Join the hey thursday organizer community
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
