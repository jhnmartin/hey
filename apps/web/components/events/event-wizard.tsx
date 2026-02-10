"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useOrg } from "@/components/org-context"
import { Button } from "@/components/ui/button"
import { StepEventType } from "./step-event-type"
import { StepClassification } from "./step-classification"
import { StepDetails } from "./step-details"
import { StepTickets } from "./step-tickets"
import {
  eventFormSchema,
  eventFormDefaults,
  type EventFormValues,
  type EventType,
} from "./event-form-schema"

function combineDateTime(date?: string, time?: string): number | undefined {
  if (!date) return undefined
  const dateStr = time ? `${date}T${time}` : date
  const ms = new Date(dateStr).getTime()
  return isNaN(ms) ? undefined : ms
}

// ─── Date generation for recurring events ───────────────────────────────

function generateRecurringDates(
  startDate: string,
  frequency: string,
  count: number,
  endDate?: string,
): string[] {
  const dates: string[] = []
  let current = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  for (let i = 0; i < count; i++) {
    if (end && current > end) break
    dates.push(current.toISOString().split("T")[0]!)

    switch (frequency) {
      case "daily":
        current = new Date(current.getTime() + 86400000)
        break
      case "weekly":
        current = new Date(current.getTime() + 7 * 86400000)
        break
      case "biweekly":
        current = new Date(current.getTime() + 14 * 86400000)
        break
      case "monthly":
        current = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate())
        break
    }
  }

  return dates
}

// ─── Build events data for recurring series ─────────────────────────────

function buildSeriesEvents(values: EventFormValues) {
  const dates = generateRecurringDates(
    values.seriesStartDate || new Date().toISOString().split("T")[0]!,
    values.recurrenceFrequency || "weekly",
    values.generateCount || 4,
    values.seriesEndDate || undefined,
  )

  return dates.map((date) => ({
    name: values.name,
    tagline: values.tagline || undefined,
    description: values.description || undefined,
    startDate: combineDateTime(date, values.recurrenceStartTime),
    endDate: combineDateTime(date, values.recurrenceEndTime),
    doorsOpen: combineDateTime(date, values.recurrenceDoorsOpenTime),
    venues: values.venues.length > 0 ? values.venues : undefined,
    coverImageId: (values.coverImageId || undefined) as any,
  }))
}

export function EventWizard() {
  const router = useRouter()
  const { activeOrg } = useOrg()
  const createEvent = useMutation(api.events.create)
  const createTicket = useMutation(api.ticketTypes.create)
  const createSeries = useMutation(api.eventSeries.create)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: eventFormDefaults,
    mode: "onTouched",
  })

  const eventType = form.watch("eventType") as EventType

  const buildSingleArgs = (values: EventFormValues, status: "draft" | "published") => {
    return {
      name: values.name,
      tagline: values.tagline || undefined,
      description: values.description || undefined,
      startDate: combineDateTime(values.startDate, values.startTime),
      endDate: combineDateTime(values.endDate, values.endTime),
      doorsOpen: combineDateTime(values.doorsOpenDate, values.doorsOpenTime),
      venues: values.venues.length > 0 ? values.venues : undefined,
      coverImageId: (values.coverImageId || undefined) as any,
      status: status as "draft" | "published",
      visibility: values.visibility,
      tags: values.tags.length > 0 ? values.tags : undefined,
      ageRestriction: values.ageRestriction,
      capacity:
        values.capacity !== "" && values.capacity !== undefined
          ? Number(values.capacity)
          : undefined,
      ownerOrgId: activeOrg!._id,
      eventType: "single" as const,
      isFreeEvent: values.isFreeEvent,
    }
  }

  const submitSingle = async (values: EventFormValues, status: "draft" | "published") => {
    const eventId = await createEvent(buildSingleArgs(values, status))

    for (let i = 0; i < values.ticketTypes.length; i++) {
      const ticket = values.ticketTypes[i]!
      if (ticket.name) {
        await createTicket({
          eventId,
          name: ticket.name,
          description: ticket.description || undefined,
          price: values.isFreeEvent ? 0 : ticket.price,
          quantity: ticket.quantity,
          sortOrder: i,
          status: "active",
        })
      }
    }

    return eventId
  }

  const submitSeries = async (values: EventFormValues, status: "draft" | "published") => {
    const events = buildSeriesEvents(values)

    const result = await createSeries({
      name: values.name,
      tagline: values.tagline || undefined,
      description: values.description || undefined,
      seriesType: "recurring" as const,
      coverImageId: (values.coverImageId || undefined) as any,
      ownerOrgId: activeOrg!._id,
      isFreeEvent: values.isFreeEvent,
      ageRestriction: values.ageRestriction,
      visibility: values.visibility,
      capacity:
        values.capacity !== "" && values.capacity !== undefined
          ? Number(values.capacity)
          : undefined,
      tags: values.tags.length > 0 ? values.tags : undefined,
      ticketTemplates: values.ticketTypes.map((t) => ({
        name: t.name,
        price: values.isFreeEvent ? 0 : t.price,
        quantity: t.quantity,
        description: t.description || undefined,
      })),
      recurrence: {
        frequency: values.recurrenceFrequency || ("weekly" as const),
        dayOfWeek: values.recurrenceDayOfWeek,
        dayOfMonth: values.recurrenceDayOfMonth,
        startTime: values.recurrenceStartTime || undefined,
        endTime: values.recurrenceEndTime || undefined,
        doorsOpenTime: values.recurrenceDoorsOpenTime || undefined,
        seriesStartDate: values.seriesStartDate || undefined,
        seriesEndDate: values.seriesEndDate || undefined,
      },
      events,
      status,
    })

    // Navigate to the first generated event
    return result.eventIds[0]
  }

  const saveAsDraft = async () => {
    const name = form.getValues("name")
    if (!name) {
      form.setError("name", { message: "Event name is required to save" })
      return
    }

    setSubmitting(true)
    try {
      const values = form.getValues()
      let eventId: string | undefined

      if (values.eventType === "single") {
        eventId = await submitSingle(values, "draft")
      } else {
        eventId = await submitSeries(values, "draft")
      }

      if (eventId) {
        router.push(`/dashboard/events/${eventId}`)
      }
    } catch (error) {
      console.error("Failed to save draft:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const publishEvent = async () => {
    const valid = await form.trigger()
    if (!valid) return

    const values = form.getValues()

    if (values.eventType === "single") {
      if (!values.startDate) {
        form.setError("startDate", { message: "Start date is required to publish" })
        return
      }
    }

    if (values.eventType === "recurring") {
      if (!values.seriesStartDate) {
        form.setError("seriesStartDate", { message: "Series start date is required" })
        return
      }
    }

    setSubmitting(true)
    try {
      let eventId: string | undefined

      if (values.eventType === "single") {
        eventId = await submitSingle(values, "published")
      } else {
        eventId = await submitSeries(values, "published")
      }

      if (eventId) {
        router.push(`/dashboard/events/${eventId}`)
      }
    } catch (error) {
      console.error("Failed to publish event:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeOrg) {
    return (
      <p className="text-muted-foreground">
        Select an organization to create an event.
      </p>
    )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-10 pb-8">
        <StepEventType />
        <StepClassification />
        <StepDetails />
        <StepTickets />

        <div className="flex gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={saveAsDraft}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="button"
            onClick={publishEvent}
            disabled={submitting}
          >
            {submitting ? "Publishing..." : "Publish Event"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
