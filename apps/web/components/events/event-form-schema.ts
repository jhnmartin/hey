import { z } from "zod/v4"

export const EVENT_TYPES = ["single", "recurring"] as const
export type EventType = (typeof EVENT_TYPES)[number]

const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
})

const ticketTypeSchema = z.object({
  clientId: z.string(),
  name: z.string().min(1, "Ticket name is required"),
  price: z.number().min(0, "Price cannot be negative"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  description: z.string().optional(),
})

export const eventFormSchema = z.object({
  // Step 0: Event Type
  eventType: z.enum(["single", "recurring"]),

  // Step 1: Classification
  isFreeEvent: z.boolean(),
  ageRestriction: z.enum(["all_ages", "18_plus", "21_plus"]),
  visibility: z.enum(["public", "private"]),

  // Step 2: Details (shared across types)
  name: z.string().min(1, "Event name is required"),
  tagline: z.string().max(160, "Maximum 160 characters").optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).max(5, "Maximum 5 tags"),
  coverImageId: z.string().nullable(),

  // Step 2: Details — Single event dates
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  doorsOpenDate: z.string().optional(),
  doorsOpenTime: z.string().optional(),
  venues: z.array(venueSchema),
  capacity: z.union([z.number().int().min(0), z.literal("")]).optional(),

  // Step 2: Details — Recurring
  recurrenceFrequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
  recurrenceDayOfWeek: z.number().optional(),
  recurrenceDayOfMonth: z.number().optional(),
  recurrenceStartTime: z.string().optional(),
  recurrenceEndTime: z.string().optional(),
  recurrenceDoorsOpenTime: z.string().optional(),
  seriesStartDate: z.string().optional(),
  seriesEndDate: z.string().optional(),
  generateCount: z.number().int().min(1).optional(),

  // Step 3: Tickets
  ticketTypes: z.array(ticketTypeSchema).min(1, "At least one ticket type is required"),
})

export type EventFormValues = z.infer<typeof eventFormSchema>

export const eventFormDefaults: EventFormValues = {
  eventType: "single",
  isFreeEvent: false,
  ageRestriction: "all_ages",
  visibility: "public",
  name: "",
  tagline: "",
  description: "",
  tags: [],
  coverImageId: null,
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  doorsOpenDate: "",
  doorsOpenTime: "",
  venues: [],
  capacity: "",
  recurrenceFrequency: "weekly",
  recurrenceDayOfWeek: undefined,
  recurrenceDayOfMonth: undefined,
  recurrenceStartTime: "",
  recurrenceEndTime: "",
  recurrenceDoorsOpenTime: "",
  seriesStartDate: "",
  seriesEndDate: "",
  generateCount: 4,
  ticketTypes: [
    {
      clientId: crypto.randomUUID(),
      name: "General Admission",
      price: 0,
      quantity: 100,
      description: "",
    },
  ],
}

// Fields to validate per step, type-aware
export function getStepFields(step: number, eventType: EventType): (keyof EventFormValues)[] {
  switch (step) {
    case 0: // Event Type
      return ["eventType"]
    case 1: // Classification
      return ["ageRestriction", "visibility"]
    case 2: // Details
      switch (eventType) {
        case "single":
          return ["name"]
        case "recurring":
          return ["name", "recurrenceFrequency", "seriesStartDate"]
      }
      break
    case 3: // Tickets
      return ["ticketTypes"]
    case 4: // Review
      return []
  }
  return []
}
