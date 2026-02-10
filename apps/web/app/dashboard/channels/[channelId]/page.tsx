import type { Metadata } from "next"
import { SetPageTitle } from "@/components/page-title-context"

export const metadata: Metadata = {
  title: "Channel",
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>
}) {
  const { channelId } = await params

  return (
    <div className="flex min-h-[70vh] flex-col">
      <SetPageTitle title={`#${channelId}`} />
      <div className="border-b pb-3">
        <p className="text-muted-foreground text-sm">
          {channelId === "general"
            ? "Company-wide announcements and updates"
            : channelId === "random"
              ? "Non-work chatter, water cooler talk"
              : `Channel: ${channelId}`}
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3 py-4">
        <div className="flex gap-3">
          <div className="bg-muted size-8 shrink-0 rounded-full" />
          <div>
            <p className="text-sm">
              <span className="font-medium">Jordan Smith</span>
              <span className="text-muted-foreground ml-2 text-xs">
                10:30 AM
              </span>
            </p>
            <p className="text-sm">
              {channelId === "general"
                ? "Welcome to hey thursday! This is your team's home base."
                : "Hey everyone, what's good?"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-muted size-8 shrink-0 rounded-full" />
          <div>
            <p className="text-sm">
              <span className="font-medium">Alex Rivera</span>
              <span className="text-muted-foreground ml-2 text-xs">
                10:45 AM
              </span>
            </p>
            <p className="text-sm">
              {channelId === "general"
                ? "Excited to get started on the next event!"
                : "Not much, just vibing"}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t pt-3">
        <div className="bg-background flex h-10 items-center rounded-lg border px-4">
          <span className="text-muted-foreground text-sm">
            Message #{channelId}...
          </span>
        </div>
      </div>
    </div>
  )
}
