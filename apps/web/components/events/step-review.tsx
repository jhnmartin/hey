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

export function StepReview() {
  const form = useFormContext<EventFormValues>()
  const values = form.getValues()

  const imageUrl = useQuery(
    api.storage.getUrl,
    values.coverImageId ? { storageId: values.coverImageId as any } : "skip",
  )

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return null
    return time ? `${date} at ${time}` : date
  }

  return (
    <div className="space-y-5">
      <Section title="Basics">
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
        </div>
      </Section>

      <Section title="Tickets">
        <div className="space-y-3">
          {values.isFreeEvent && (
            <Badge variant="secondary">Free Event</Badge>
          )}
          <Field label="Age Restriction" value={ageLabels[values.ageRestriction]} />
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

      <Section title="Settings">
        <div className="space-y-1">
          <Field
            label="Visibility"
            value={values.visibility === "public" ? "Public" : "Private"}
          />
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
    </div>
  )
}
