"use client"

import { useFormContext } from "react-hook-form"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import type { EventFormValues } from "./event-form-schema"
import { Badge } from "@/components/ui/badge"

const ageLabels: Record<string, string> = {
  all_ages: "All Ages",
  "18_plus": "18+",
  "21_plus": "21+",
}

const typeLabels: Record<string, string> = {
  single: "Single Event",
  recurring: "Recurring Series",
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {title}
      </h3>
      <div className="bg-muted/50 rounded-lg p-4">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <span className="text-muted-foreground text-sm">{label}: </span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function formatDateTime(date?: string, time?: string) {
  if (!date) return null
  return time ? `${date} at ${time}` : date
}

// ─── Type-specific review sections ───────────────────────────────────────

function SingleReview({ values }: { values: EventFormValues }) {
  return (
    <Section title="Date & Location">
      <div className="space-y-1">
        <Field label="Starts" value={formatDateTime(values.startDate, values.startTime)} />
        <Field label="Ends" value={formatDateTime(values.endDate, values.endTime)} />
        <Field
          label="Doors Open"
          value={formatDateTime(values.doorsOpenDate, values.doorsOpenTime)}
        />
        {values.venues.map((venue, i) => (
          <div key={i}>
            <Field
              label={i === 0 ? "Primary Venue" : "Venue"}
              value={venue.name}
            />
            <Field
              label="Address"
              value={
                [venue.address, venue.city, venue.state, venue.zip]
                  .filter(Boolean)
                  .join(", ") || undefined
              }
            />
          </div>
        ))}
        <Field
          label="Capacity"
          value={
            values.capacity !== "" && values.capacity !== undefined && values.capacity > 0
              ? String(values.capacity)
              : "Unlimited"
          }
        />
      </div>
    </Section>
  )
}

function RecurringReview({ values }: { values: EventFormValues }) {
  const count = values.generateCount ?? 4
  const freq = values.recurrenceFrequency ?? "weekly"

  return (
    <Section title="Recurrence">
      <div className="space-y-1">
        <Field label="Frequency" value={frequencyLabels[freq] ?? freq} />
        <Field label="Series Starts" value={values.seriesStartDate} />
        <Field label="Series Ends" value={values.seriesEndDate || "Ongoing"} />
        <Field label="Events to Generate" value={String(count)} />
        <Field label="Start Time" value={values.recurrenceStartTime} />
        <Field label="End Time" value={values.recurrenceEndTime} />
        <Field label="Doors Open" value={values.recurrenceDoorsOpenTime} />
        {values.venues.length > 0 && (
          <Field label="Venue" value={values.venues[0]?.name} />
        )}
        <Field
          label="Capacity per Event"
          value={
            values.capacity !== "" && values.capacity !== undefined && values.capacity > 0
              ? String(values.capacity)
              : "Unlimited"
          }
        />
      </div>
    </Section>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────

export function StepReview() {
  const form = useFormContext<EventFormValues>()
  const values = form.getValues()

  const imageUrl = useQuery(
    api.storage.getUrl,
    values.coverImageId ? { storageId: values.coverImageId as any } : "skip",
  )

  return (
    <div className="space-y-5">
      <Section title="Event Type">
        <Badge variant="secondary">{typeLabels[values.eventType]}</Badge>
      </Section>

      <Section title="Classification">
        <div className="flex flex-wrap gap-2">
          {values.isFreeEvent && <Badge variant="secondary">Free Event</Badge>}
          <Badge variant="outline">{ageLabels[values.ageRestriction]}</Badge>
          <Badge variant="outline">
            {values.visibility === "public" ? "Public" : "Private"}
          </Badge>
        </div>
      </Section>

      <Section title="Details">
        <div className="space-y-1">
          <p className="text-lg font-semibold">{values.name || "Untitled Event"}</p>
          <Field label="Short Description" value={values.tagline} />
          <Field label="Description" value={values.description} />
          {values.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-sm">Tags: </span>
              {values.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Cover"
            className="mt-3 h-32 w-full rounded-md object-cover"
          />
        )}
      </Section>

      {values.eventType === "single" && <SingleReview values={values} />}
      {values.eventType === "recurring" && <RecurringReview values={values} />}

      <Section title="Tickets">
        <div className="space-y-3">
          {values.ticketTypes.map((ticket) => (
            <div
              key={ticket.clientId}
              className="flex items-center justify-between text-sm"
            >
              <span>{ticket.name || "Unnamed"}</span>
              <span className="text-muted-foreground">
                {values.isFreeEvent ? "Free" : `${ticket.price}¢`} &middot;{" "}
                {ticket.quantity} available
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
