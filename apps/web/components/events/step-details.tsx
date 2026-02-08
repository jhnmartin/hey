"use client"

import { useState } from "react"
import { useFormContext, useFieldArray } from "react-hook-form"
import type { EventFormValues } from "./event-form-schema"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageUploader } from "@/components/image-uploader"
import { TagInput } from "@/components/tag-input"
import { VenueAutocomplete } from "@/components/venue-autocomplete"
import { cn } from "@/lib/utils"
import {
  IconPlus,
  IconX,
  IconStar,
  IconStarFilled,
  IconGripVertical,
} from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground/60 text-[11px] leading-tight">
      {children}
    </p>
  )
}

function DateTimeRow({
  label,
  dateName,
  timeName,
  hint,
}: {
  label: string
  dateName: "startDate" | "endDate" | "doorsOpenDate" | "multiStartDate" | "multiEndDate"
  timeName: "startTime" | "endTime" | "doorsOpenTime" | "multiStartTime" | "multiEndTime"
  hint: string
}) {
  const form = useFormContext<EventFormValues>()

  return (
    <div className="space-y-1">
      <FormLabel>{label}</FormLabel>
      <Hint>{hint}</Hint>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={dateName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{label} date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={timeName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{label} time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ─── Shared fields: name, tagline, description, tags, cover image ────────

function SharedDetailsFields() {
  const form = useFormContext<EventFormValues>()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ImageUploader
        storageId={form.watch("coverImageId")}
        onUpload={(id) => form.setValue("coverImageId", id)}
        onRemove={() => form.setValue("coverImageId", null)}
        className="aspect-square"
      />

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name *</FormLabel>
              <Hint>
                Keep it short — no dates, venues, or brand names. We build those from event details.
              </Hint>
              <FormControl>
                <Input placeholder="e.g. Friday Night House" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <Hint>
                One line that captures the vibe — the subtitle people see before clicking. Max 160 characters.
              </Hint>
              <FormControl>
                <Textarea
                  placeholder="A short description"
                  maxLength={160}
                  className="min-h-[72px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <Hint>
                Describe the experience, not logistics. Performers, times, and venue are pulled automatically.
              </Hint>
              <FormControl>
                <Textarea
                  placeholder="Tell people what to expect..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <Hint>
                Up to 5 tags — genre, vibe, or theme. Helps people discover your event in search.
              </Hint>
              <FormControl>
                <div className="min-h-[88px] rounded-md border px-3 py-2">
                  <TagInput value={field.value} onChange={field.onChange} max={5} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ─── Venue list (reused from old step-date-location) ─────────────────────

function VenueList() {
  const form = useFormContext<EventFormValues>()
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "venues",
  })
  const [promotedId, setPromotedId] = useState<string | null>(null)

  const makePrimary = (index: number) => {
    const id = fields[index]!.id
    move(index, 0)
    setPromotedId(id)
    setTimeout(() => setPromotedId(null), 600)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <FormLabel>Add Venue</FormLabel>
        <Hint>Search for a venue — we'll fill in the address details automatically.</Hint>
        <VenueAutocomplete
          onSelect={(result) => {
            append({
              name: result.venueName,
              address: result.address,
              city: result.city,
              state: result.state,
              zip: result.zip,
            })
          }}
        />
      </div>

      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const venue = form.watch(`venues.${index}`)
            const location = [
              venue.address,
              venue.city,
              [venue.state, venue.zip].filter(Boolean).join(" "),
            ]
              .filter(Boolean)
              .join(", ")

            const isPromoted = field.id === promotedId

            return (
              <div
                key={field.id}
                className={cn(
                  "flex items-start justify-between rounded-md px-3 py-2 transition-all duration-500 ease-out",
                  isPromoted
                    ? "bg-primary/10 ring-primary/30 ring-1"
                    : "bg-muted/50",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{venue.name}</p>
                    {index === 0 && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "shrink-0 text-[10px] transition-opacity duration-500",
                          isPromoted ? "animate-in fade-in" : "",
                        )}
                      >
                        Primary
                      </Badge>
                    )}
                  </div>
                  {location && (
                    <p className="text-muted-foreground truncate text-xs">
                      {location}
                    </p>
                  )}
                </div>
                <div className="ml-2 flex shrink-0 items-center gap-0.5">
                  {index !== 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                      onClick={() => makePrimary(index)}
                      title="Make primary"
                    >
                      <IconStar className="size-3.5" />
                    </Button>
                  )}
                  {index === 0 && fields.length > 1 && (
                    <span className="text-primary flex h-7 w-7 items-center justify-center">
                      <IconStarFilled className="size-3.5" />
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                    onClick={() => remove(index)}
                  >
                    <IconX className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── One-Off sub-form ────────────────────────────────────────────────────

function OneOffDetails() {
  const form = useFormContext<EventFormValues>()
  const hasDoors = form.watch("doorsOpenDate") || form.watch("doorsOpenTime")
  const [showDoors, setShowDoors] = useState(!!hasDoors)

  return (
    <div className="space-y-6">
      <SharedDetailsFields />

      <div className="border-border space-y-4 border-t pt-5">
        <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          When
        </h3>
        <DateTimeRow
          label="Starts"
          dateName="startDate"
          timeName="startTime"
          hint="Shown on the listing. Powers search, notifications, and calendar exports."
        />
        <DateTimeRow
          label="Ends"
          dateName="endDate"
          timeName="endTime"
          hint="Helps attendees plan. Lifecycle status updates automatically when this passes."
        />
        {showDoors ? (
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <DateTimeRow
                label="Doors Open"
                dateName="doorsOpenDate"
                timeName="doorsOpenTime"
                hint="When check-in starts. Shown separately from the event start time."
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground mt-5"
              onClick={() => {
                form.setValue("doorsOpenDate", "")
                form.setValue("doorsOpenTime", "")
                setShowDoors(false)
              }}
            >
              <IconX className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowDoors(true)}
          >
            <IconPlus className="mr-1.5 size-3.5" />
            Add door time
          </Button>
        )}
      </div>

      <div className="border-border space-y-4 border-t pt-5">
        <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Where
        </h3>
        <VenueList />
      </div>

      <div className="border-border border-t pt-5">
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <Hint>Overall venue cap. Empty = no cap.</Hint>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Leave empty for unlimited"
                  className="max-w-xs"
                  value={field.value === "" || field.value === undefined ? "" : field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ─── Recurring sub-form ──────────────────────────────────────────────────

function RecurringDetails() {
  const form = useFormContext<EventFormValues>()

  return (
    <div className="space-y-6">
      <SharedDetailsFields />

      <div className="border-border space-y-4 border-t pt-5">
        <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Recurrence
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="recurrenceFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Hint>How often this event repeats.</Hint>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? "weekly"}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="generateCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Generate Count</FormLabel>
                <Hint>How many events to create upfront.</Hint>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={52}
                    placeholder="4"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="seriesStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Series Starts</FormLabel>
                <Hint>Date of the first occurrence.</Hint>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seriesEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Series Ends (optional)</FormLabel>
                <Hint>Leave empty for ongoing.</Hint>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="recurrenceStartTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recurrenceEndTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recurrenceDoorsOpenTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doors Open</FormLabel>
                <Hint>Optional</Hint>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-border space-y-4 border-t pt-5">
          <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Venue (applied to all occurrences)
          </h3>
          <VenueList />
        </div>

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity per Event</FormLabel>
              <Hint>Applied to each occurrence. Empty = no cap.</Hint>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Leave empty for unlimited"
                  className="max-w-xs"
                  value={field.value === "" || field.value === undefined ? "" : field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ─── Tour / Series sub-form ─────────────────────────────────────────────

function TourDetails() {
  const form = useFormContext<EventFormValues>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tourStops",
  })

  return (
    <div className="space-y-6">
      <SharedDetailsFields />

      <div className="border-border space-y-4 border-t pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Stops
          </h3>
          <span className="text-muted-foreground text-xs">
            {fields.length} stop{fields.length !== 1 ? "s" : ""}
            {fields.length < 2 && " (min 2)"}
          </span>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-muted/30 space-y-3 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconGripVertical className="text-muted-foreground/40 size-4" />
                  <span className="text-muted-foreground text-xs font-medium">
                    Stop {index + 1}
                  </span>
                </div>
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 w-7 p-0"
                    onClick={() => remove(index)}
                  >
                    <IconX className="size-3.5" />
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`tourStops.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Stop name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name override (optional)"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name={`tourStops.${index}.date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tourStops.${index}.time`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Start</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tourStops.${index}.endTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">End</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1">
                <FormLabel className="text-xs">Venue</FormLabel>
                <VenueAutocomplete
                  onSelect={(result) => {
                    form.setValue(`tourStops.${index}.venue`, {
                      name: result.venueName,
                      address: result.address,
                      city: result.city,
                      state: result.state,
                      zip: result.zip,
                    })
                  }}
                />
                {form.watch(`tourStops.${index}.venue`)?.name && (
                  <div className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-1.5">
                    <span className="text-sm">
                      {form.watch(`tourStops.${index}.venue`)?.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-6 w-6 p-0"
                      onClick={() => form.setValue(`tourStops.${index}.venue`, undefined)}
                    >
                      <IconX className="size-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ clientId: crypto.randomUUID() })}
        >
          <IconPlus className="mr-1.5 size-3.5" />
          Add Stop
        </Button>
      </div>
    </div>
  )
}

// ─── Multi-Location sub-form ─────────────────────────────────────────────

function MultiLocationDetails() {
  const form = useFormContext<EventFormValues>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "multiLocations",
  })

  return (
    <div className="space-y-6">
      <SharedDetailsFields />

      <div className="border-border space-y-4 border-t pt-5">
        <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Shared Dates
        </h3>
        <DateTimeRow
          label="Starts"
          dateName="multiStartDate"
          timeName="multiStartTime"
          hint="Shared start across all locations."
        />
        <DateTimeRow
          label="Ends"
          dateName="multiEndDate"
          timeName="multiEndTime"
          hint="Shared end across all locations."
        />
      </div>

      <div className="border-border space-y-4 border-t pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Locations
          </h3>
          <span className="text-muted-foreground text-xs">
            {fields.length} location{fields.length !== 1 ? "s" : ""}
            {fields.length < 2 && " (min 2)"}
          </span>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-muted/30 space-y-3 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">
                  Location {index + 1}
                </span>
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 w-7 p-0"
                    onClick={() => remove(index)}
                  >
                    <IconX className="size-3.5" />
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <FormLabel className="text-xs">Venue</FormLabel>
                <VenueAutocomplete
                  onSelect={(result) => {
                    form.setValue(`multiLocations.${index}.venue`, {
                      name: result.venueName,
                      address: result.address,
                      city: result.city,
                      state: result.state,
                      zip: result.zip,
                    })
                  }}
                />
                {form.watch(`multiLocations.${index}.venue`)?.name && (
                  <div className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-1.5">
                    <span className="text-sm">
                      {form.watch(`multiLocations.${index}.venue`)?.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-6 w-6 p-0"
                      onClick={() =>
                        form.setValue(`multiLocations.${index}.venue`, undefined)
                      }
                    >
                      <IconX className="size-3" />
                    </Button>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name={`multiLocations.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Description Override</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional — override shared description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ clientId: crypto.randomUUID() })}
        >
          <IconPlus className="mr-1.5 size-3.5" />
          Add Location
        </Button>
      </div>

      <div className="border-border border-t pt-5">
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity per Location</FormLabel>
              <Hint>Applied to each location. Empty = no cap.</Hint>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Leave empty for unlimited"
                  className="max-w-xs"
                  value={field.value === "" || field.value === undefined ? "" : field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────

export function StepDetails() {
  const form = useFormContext<EventFormValues>()
  const eventType = form.watch("eventType")

  switch (eventType) {
    case "one_off":
      return <OneOffDetails />
    case "recurring":
      return <RecurringDetails />
    case "tour":
      return <TourDetails />
    case "multi_location":
      return <MultiLocationDetails />
    default:
      return <OneOffDetails />
  }
}
