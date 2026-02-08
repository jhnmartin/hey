import { useWatch } from "react-hook-form"
import type { EventFormValues } from "./event-form-schema"

// Static fields that count toward progress when filled.
// Each is a key of EventFormValues and a predicate to check if it's "filled".
const STATIC_FIELDS: { key: keyof EventFormValues; filled: (v: any) => boolean }[] = [
  // Step 1: Basics
  { key: "name", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "tagline", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "description", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "tags", filled: (v) => Array.isArray(v) && v.length > 0 },
  { key: "coverImageId", filled: (v) => v != null && v !== "" },
  // Step 2: Date & Location
  { key: "startDate", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "startTime", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "endDate", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "endTime", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "doorsOpenDate", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "doorsOpenTime", filled: (v) => typeof v === "string" && v.length > 0 },
  { key: "venues", filled: (v) => Array.isArray(v) && v.length > 0 },
  // Step 4: Settings — capacity (visibility always has a value via default)
  { key: "capacity", filled: (v) => v !== "" && v !== undefined && v > 0 },
]

// Per ticket type: name and quantity always count, price counts when not a free event.
function countTicketFields(
  tickets: EventFormValues["ticketTypes"],
  isFree: boolean,
): { total: number; filled: number } {
  let total = 0
  let filled = 0

  for (const t of tickets) {
    // name
    total++
    if (t.name.length > 0) filled++

    // quantity
    total++
    if (t.quantity > 0) filled++

    // price (only when not free)
    if (!isFree) {
      total++
      if (t.price > 0) filled++
    }
  }

  return { total, filled }
}

export function useFormProgress(): number {
  const values = useWatch<EventFormValues>()

  let total = STATIC_FIELDS.length
  let filled = 0

  for (const f of STATIC_FIELDS) {
    if (f.filled(values[f.key])) filled++
  }

  const tickets = (values.ticketTypes ?? []) as EventFormValues["ticketTypes"]
  const isFree = (values.isFreeEvent ?? false) as boolean
  const ticketCounts = countTicketFields(tickets, isFree)
  total += ticketCounts.total
  filled += ticketCounts.filled

  if (total === 0) return 0
  return Math.round((filled / total) * 100)
}
