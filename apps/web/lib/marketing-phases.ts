export type MarketingPhase =
  | "planning"
  | "announce"
  | "on-sale"
  | "closeout"
  | "ended"

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface EventForPhase {
  status: "draft" | "published" | "archived"
  lifecycle: "upcoming" | "postponed" | "started" | "ended" | "cancelled"
  startDate?: number
  endDate?: number
  publishedAt?: number
  _creationTime: number
}

/**
 * Compute the marketing phase for an event.
 * Returns null for excluded events (archived or cancelled).
 */
export function computeMarketingPhase(
  event: EventForPhase,
  now: number = Date.now(),
): MarketingPhase | null {
  // 1. Ended
  if (event.lifecycle === "ended") return "ended"
  const effectiveEnd = event.endDate ?? event.startDate
  if (effectiveEnd && effectiveEnd < now) return "ended"

  // 2. Excluded
  if (event.status === "archived" || event.lifecycle === "cancelled") return null

  // 3. Planning (draft)
  if (event.status === "draft") return "planning"

  // Published events below — determine Closeout vs Announce vs On Sale
  // 4. Closeout: within 10 days of start and start is in the future
  if (event.startDate && event.startDate > now && event.startDate - now <= TEN_DAYS_MS) {
    return "closeout"
  }

  // 5. Announce: published within last 7 days
  if (event.publishedAt && now - event.publishedAt <= SEVEN_DAYS_MS) {
    return "announce"
  }

  // 6. On Sale: catch-all for published
  return "on-sale"
}

/**
 * Group events by their marketing phase, excluding nulls (archived/cancelled).
 */
export function groupEventsByPhase<T extends EventForPhase>(
  events: T[],
  now: number = Date.now(),
): Map<MarketingPhase, T[]> {
  const map = new Map<MarketingPhase, T[]>()
  for (const event of events) {
    const phase = computeMarketingPhase(event, now)
    if (!phase) continue
    const list = map.get(phase) ?? []
    list.push(event)
    map.set(phase, list)
  }
  return map
}

/**
 * Get a contextual label for an event within its phase (e.g. "3 days left").
 */
export function getPhaseContextLabel(
  event: EventForPhase,
  phase: MarketingPhase,
  now: number = Date.now(),
): string {
  const daysFromNow = (ts: number) => {
    const d = Math.round((ts - now) / (24 * 60 * 60 * 1000))
    if (d === 0) return "Today"
    if (d === 1) return "1 day"
    return `${d} days`
  }

  const daysAgo = (ts: number) => {
    const d = Math.round((now - ts) / (24 * 60 * 60 * 1000))
    if (d === 0) return "Today"
    if (d === 1) return "1 day ago"
    return `${d} days ago`
  }

  switch (phase) {
    case "closeout":
      return event.startDate ? `${daysFromNow(event.startDate)} left` : "—"
    case "announce":
      return event.publishedAt ? `Published ${daysAgo(event.publishedAt)}` : "Recently published"
    case "on-sale": {
      if (!event.startDate) return "No start date"
      const daysUntilCloseout = Math.round((event.startDate - TEN_DAYS_MS - now) / (24 * 60 * 60 * 1000))
      if (daysUntilCloseout <= 0) return "Closeout soon"
      return `${daysUntilCloseout} day${daysUntilCloseout === 1 ? "" : "s"} until closeout`
    }
    case "planning":
      return "Draft"
    case "ended": {
      const effectiveEnd = event.endDate ?? event.startDate
      return effectiveEnd ? `Ended ${daysAgo(effectiveEnd)}` : "Ended"
    }
  }
}

export const PHASE_DISPLAY_ORDER: MarketingPhase[] = [
  "closeout",
  "announce",
  "on-sale",
  "planning",
  "ended",
]

export const PHASE_INFO: Record<
  MarketingPhase,
  { label: string; description: string; tips: string[] }
> = {
  closeout: {
    label: "Closeout",
    description: "Final push — these events start within 10 days.",
    tips: [
      "Send last-chance reminders via SMS and push notifications",
      "Post countdowns and behind-the-scenes content on social",
      "Activate any remaining promo codes or flash sales",
      "Confirm day-of logistics with your team and collaborators",
    ],
  },
  announce: {
    label: "Announce",
    description: "Recently published — build awareness while momentum is fresh.",
    tips: [
      "Share the event link across all your social channels",
      "Send an announcement email to your mailing list",
      "Reach out to collaborators and ask them to share too",
      "Consider a launch-week promo code to drive early sales",
    ],
  },
  "on-sale": {
    label: "On Sale",
    description: "Tickets are live — maintain steady promotion.",
    tips: [
      "Schedule recurring social posts to keep visibility high",
      "Monitor ticket sales and adjust pricing or tiers if needed",
      "Engage with your audience — reply to comments and DMs",
      "Plan a mid-campaign boost if sales plateau",
    ],
  },
  planning: {
    label: "Planning",
    description: "Draft events — finalize details and publish when ready.",
    tips: [
      "Fill in all required fields: date, venue, description",
      "Upload a high-quality cover image",
      "Set up ticket tiers and pricing",
      "Invite collaborators before going live",
    ],
  },
  ended: {
    label: "Ended",
    description: "Past events — review performance and engage attendees.",
    tips: [
      "Send a thank-you message to attendees",
      "Review attendance and ticket sales data",
      "Collect feedback or ratings for future events",
      "Share highlights and photos to keep the conversation going",
    ],
  },
}

export const MAINTENANCE_TIPS = [
  "Grow your audience — post content, engage on social, collect email subscribers",
  "Update your organization profile and branding",
  "Review past event performance for insights",
  "Start planning your next event as a draft",
]
