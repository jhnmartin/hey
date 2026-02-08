import { useWatch } from "react-hook-form"
import type { EventFormValues } from "./event-form-schema"

type FieldCheck = { key: keyof EventFormValues; filled: (v: any) => boolean }

const isNonEmpty = (v: any) => typeof v === "string" && v.length > 0
const isArrayFilled = (v: any) => Array.isArray(v) && v.length > 0

// Shared fields that always count
const SHARED_FIELDS: FieldCheck[] = [
  { key: "name", filled: isNonEmpty },
  { key: "tagline", filled: isNonEmpty },
  { key: "description", filled: isNonEmpty },
  { key: "tags", filled: isArrayFilled },
  { key: "coverImageId", filled: (v) => v != null && v !== "" },
]

// One-off specific fields
const ONE_OFF_FIELDS: FieldCheck[] = [
  { key: "startDate", filled: isNonEmpty },
  { key: "startTime", filled: isNonEmpty },
  { key: "endDate", filled: isNonEmpty },
  { key: "endTime", filled: isNonEmpty },
  { key: "venues", filled: isArrayFilled },
  { key: "capacity", filled: (v) => v !== "" && v !== undefined && v > 0 },
]

// Recurring specific fields
const RECURRING_FIELDS: FieldCheck[] = [
  { key: "recurrenceFrequency", filled: isNonEmpty },
  { key: "seriesStartDate", filled: isNonEmpty },
  { key: "recurrenceStartTime", filled: isNonEmpty },
  { key: "recurrenceEndTime", filled: isNonEmpty },
  { key: "generateCount", filled: (v) => v !== undefined && v > 0 },
  { key: "venues", filled: isArrayFilled },
]

// Tour specific
const TOUR_FIELDS: FieldCheck[] = [
  { key: "tourStops", filled: (v) => Array.isArray(v) && v.filter((s: any) => s.date || s.venue).length >= 2 },
]

// Multi-location specific
const MULTI_LOCATION_FIELDS: FieldCheck[] = [
  { key: "multiStartDate", filled: isNonEmpty },
  { key: "multiStartTime", filled: isNonEmpty },
  { key: "multiLocations", filled: (v) => Array.isArray(v) && v.filter((l: any) => l.venue).length >= 2 },
]

function getFieldsForType(eventType: string): FieldCheck[] {
  switch (eventType) {
    case "recurring":
      return [...SHARED_FIELDS, ...RECURRING_FIELDS]
    case "tour":
      return [...SHARED_FIELDS, ...TOUR_FIELDS]
    case "multi_location":
      return [...SHARED_FIELDS, ...MULTI_LOCATION_FIELDS]
    default:
      return [...SHARED_FIELDS, ...ONE_OFF_FIELDS]
  }
}

function countTicketFields(
  tickets: EventFormValues["ticketTypes"],
  isFree: boolean,
): { total: number; filled: number } {
  let total = 0
  let filled = 0

  for (const t of tickets) {
    total++
    if (t.name.length > 0) filled++

    total++
    if (t.quantity > 0) filled++

    if (!isFree) {
      total++
      if (t.price > 0) filled++
    }
  }

  return { total, filled }
}

export function useFormProgress(): number {
  const values = useWatch<EventFormValues>()

  const eventType = (values.eventType ?? "one_off") as string
  const staticFields = getFieldsForType(eventType)

  let total = staticFields.length
  let filled = 0

  for (const f of staticFields) {
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
