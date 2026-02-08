"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useOrg } from "@/components/org-context"
import { Button } from "@/components/ui/button"
import { StepBasics } from "./step-basics"
import { StepDateLocation } from "./step-date-location"
import { StepTickets } from "./step-tickets"
import { StepSettings } from "./step-settings"
import { StepReview } from "./step-review"
import {
  eventFormSchema,
  eventFormDefaults,
  stepFields,
  type EventFormValues,
} from "./event-form-schema"
import { useFormProgress } from "./use-form-progress"

const STEPS = [
  { label: "Basics", component: StepBasics },
  { label: "Date & Location", component: StepDateLocation },
  { label: "Tickets", component: StepTickets },
  { label: "Settings", component: StepSettings },
  { label: "Review", component: StepReview },
]

function ProgressBar({ stepLabel }: { stepLabel: string }) {
  const percent = useFormProgress()

  return (
    <div>
      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-muted-foreground mt-1 flex items-center justify-between text-xs">
        <span>{stepLabel}</span>
        <span>{percent}%</span>
      </div>
    </div>
  )
}

function combineDateTime(date?: string, time?: string): number | undefined {
  if (!date) return undefined
  const dateStr = time ? `${date}T${time}` : date
  const ms = new Date(dateStr).getTime()
  return isNaN(ms) ? undefined : ms
}

export function EventWizard() {
  const router = useRouter()
  const { activeOrg } = useOrg()
  const createEvent = useMutation(api.events.create)
  const createTicket = useMutation(api.ticketTypes.create)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: eventFormDefaults,
    mode: "onTouched",
  })

  const StepComponent = STEPS[step]!.component

  const goNext = async () => {
    const fields = stepFields[step]
    if (fields && fields.length > 0) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const buildEventArgs = (values: EventFormValues, status: "draft" | "published") => {
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
    }
  }

  const saveAsDraft = async () => {
    const name = form.getValues("name")
    if (!name) {
      form.setError("name", { message: "Event name is required to save" })
      setStep(0)
      return
    }

    setSubmitting(true)
    try {
      const values = form.getValues()
      const eventId = await createEvent(buildEventArgs(values, "draft"))

      // Create ticket types
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

      router.push(`/dashboard/events/${eventId}`)
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

    // Extra publish checks
    if (!values.startDate) {
      form.setError("startDate", { message: "Start date is required to publish" })
      setStep(1)
      return
    }
    if (values.venues.length === 0) {
      setStep(1)
      return
    }

    setSubmitting(true)
    try {
      const eventId = await createEvent(buildEventArgs(values, "published"))

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

      router.push(`/dashboard/events/${eventId}`)
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
    <div>
      <FormProvider {...form}>
        <ProgressBar stepLabel={STEPS[step]!.label} />
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="min-h-[460px] py-6">
            <StepComponent />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={submitting}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={saveAsDraft}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save as Draft"}
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={goNext} disabled={submitting}>
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={publishEvent}
                  disabled={submitting}
                >
                  {submitting ? "Publishing..." : "Publish Event"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
