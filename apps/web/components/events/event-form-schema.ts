import { z } from "zod/v4"

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
  // Step 1: Basics
  name: z.string().min(1, "Event name is required"),
  tagline: z.string().max(160, "Maximum 160 characters").optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).max(5, "Maximum 5 tags"),
  ageRestriction: z.enum(["all_ages", "18_plus", "21_plus"]),
  coverImageId: z.string().nullable(),

  // Step 2: Date & Location
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  doorsOpenDate: z.string().optional(),
  doorsOpenTime: z.string().optional(),
  venues: z.array(venueSchema),

  // Step 3: Tickets
  isFreeEvent: z.boolean(),
  ticketTypes: z.array(ticketTypeSchema).min(1, "At least one ticket type is required"),

  // Step 4: Settings
  visibility: z.enum(["public", "private"]),
  capacity: z.union([z.number().int().min(0), z.literal("")]).optional(),
})

export type EventFormValues = z.infer<typeof eventFormSchema>

export const eventFormDefaults: EventFormValues = {
  name: "",
  tagline: "",
  description: "",
  tags: [],
  ageRestriction: "all_ages",
  coverImageId: null,
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  doorsOpenDate: "",
  doorsOpenTime: "",
  venues: [],
  isFreeEvent: false,
  ticketTypes: [
    {
      clientId: crypto.randomUUID(),
      name: "General Admission",
      price: 0,
      quantity: 100,
      description: "",
    },
  ],
  visibility: "public",
  capacity: "",
}

// Fields to validate per step
export const stepFields: Record<number, (keyof EventFormValues)[]> = {
  0: ["name"],
  1: [],
  2: ["ticketTypes", "ageRestriction"],
  3: ["visibility"],
  4: [],
}
