"use client"

import { useFormContext } from "react-hook-form"
import type { EventFormValues, EventType } from "./event-form-schema"
import { cn } from "@/lib/utils"
import {
  IconCalendarEvent,
  IconRepeat,
  IconRoute,
  IconMapPins,
} from "@tabler/icons-react"

const EVENT_TYPE_CARDS: {
  value: EventType
  title: string
  description: string
  example: string
  icon: typeof IconCalendarEvent
}[] = [
  {
    value: "one_off",
    title: "One-Off",
    description:
      "A single event — whether one night or multiple days, at one venue or several.",
    example: "Album release party, holiday bash",
    icon: IconCalendarEvent,
  },
  {
    value: "recurring",
    title: "Recurring",
    description:
      "Repeats on a schedule. Core details stay the same, each occurrence gets its own tickets.",
    example: "Weekly club night, monthly open mic",
    icon: IconRepeat,
  },
  {
    value: "tour",
    title: "Tour / Series",
    description:
      "A common thread across stops — but venues, dates, and details change per event.",
    example: "DJ tour, concert series",
    icon: IconRoute,
  },
  {
    value: "multi_location",
    title: "Multi-Location",
    description:
      "Same event at different locations, on the same or close dates.",
    example: "Record Store Day, bar crawl",
    icon: IconMapPins,
  },
]

export function StepEventType() {
  const form = useFormContext<EventFormValues>()
  const selected = form.watch("eventType")

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Let's Get Started</h2>
        <p className="text-muted-foreground text-sm">
          What kind of event are you creating?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {EVENT_TYPE_CARDS.map((card) => {
          const Icon = card.icon
          const isSelected = selected === card.value
          return (
            <button
              key={card.value}
              type="button"
              onClick={() => form.setValue("eventType", card.value)}
              className={cn(
                "rounded-lg border p-4 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-primary/30 ring-1"
                  : "hover:border-foreground/20 border-border",
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon
                  className={cn(
                    "size-5",
                    isSelected
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <span className="text-sm font-medium">{card.title}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {card.description}
              </p>
              <p className="text-muted-foreground/60 mt-1.5 text-[11px]">
                e.g. {card.example}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
