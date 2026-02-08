"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import type { EventFormValues } from "./event-form-schema"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconPlus, IconX, IconStar, IconStarFilled } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { VenueAutocomplete } from "@/components/venue-autocomplete"
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
  dateName: "startDate" | "endDate" | "doorsOpenDate"
  timeName: "startTime" | "endTime" | "doorsOpenTime"
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

export function StepDateLocation() {
  const form = useFormContext<EventFormValues>()
  const hasDoors = form.watch("doorsOpenDate") || form.watch("doorsOpenTime")
  const [showDoors, setShowDoors] = useState(!!hasDoors)

  return (
    <div className="space-y-5">
      <div className="space-y-4">
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
    </div>
  )
}

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
                    <p className="text-muted-foreground truncate text-xs">{location}</p>
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
