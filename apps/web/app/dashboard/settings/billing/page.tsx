import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Billing",
}

export default function BillingSettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Billing</h1>
      <div className="bg-muted/50 max-w-2xl rounded-xl p-6">
        <h3 className="font-semibold">Current Plan</h3>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-lg font-medium">Pro</p>
            <p className="text-muted-foreground text-sm">
              $29/month &middot; Renews Mar 1, 2025
            </p>
          </div>
          <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
            Active
          </span>
        </div>
      </div>
      <div className="bg-muted/50 max-w-2xl rounded-xl p-6">
        <h3 className="font-semibold">Payment Method</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Visa ending in 4242
        </p>
      </div>
      <div className="bg-muted/50 max-w-2xl rounded-xl p-6">
        <h3 className="font-semibold">Invoice History</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Invoice history coming soon.
        </p>
      </div>
    </>
  )
}
