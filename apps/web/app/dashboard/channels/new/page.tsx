import type { Metadata } from "next"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "New Channel",
}

export default function NewChannelPage() {
  return (
    <>
      <SetPageTitle title="Create Channel" />
      <div className="bg-muted/50 max-w-lg rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Channel Name</label>
            <div className="bg-background mt-1 flex h-10 items-center rounded-md border px-3">
              <span className="text-muted-foreground text-sm">#</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <div className="bg-background mt-1 h-20 rounded-md border" />
          </div>
          <div>
            <label className="text-sm font-medium">Visibility</label>
            <div className="mt-2 flex gap-3">
              <div className="bg-primary/10 text-primary rounded-md px-3 py-1.5 text-sm font-medium">
                Public
              </div>
              <div className="bg-muted rounded-md px-3 py-1.5 text-sm font-medium">
                Private
              </div>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground inline-flex cursor-not-allowed items-center rounded-md px-4 py-2 text-sm font-medium opacity-50">
            Create Channel
          </div>
        </div>
      </div>
    </>
  )
}
