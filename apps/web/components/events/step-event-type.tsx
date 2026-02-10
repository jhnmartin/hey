"use client"

import { useFormContext } from "react-hook-form"
import type { EventFormValues, EventType } from "./event-form-schema"
import { cn } from "@/lib/utils"
import { Squircle } from "@/components/ui/squircle"

// Thursday dot positions (top %) — one for single, all five for recurring
const THURSDAY_ROWS = ["10%", "26%", "42%", "58%", "74%"]
const SINGLE_DOT_INDEX = 3 // 4th Thursday

const EVENT_TYPES: { value: EventType; label: string; dots: string[] }[] = [
  { value: "single", label: "Single", dots: [THURSDAY_ROWS[SINGLE_DOT_INDEX]!] },
  { value: "recurring", label: "Recurring", dots: THURSDAY_ROWS },
]

export function StepEventType() {
  const form = useFormContext<EventFormValues>()
  const selected = form.watch("eventType")

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Event Type</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {EVENT_TYPES.map((type) => {
          const isSelected = selected === type.value
          const isRecurring = type.value === "recurring"
          const showBorder = isRecurring && !isSelected

          const inner = (
            <Squircle
              className={cn(
                "size-full p-[2.5%] transition-colors",
                isSelected
                  ? "bg-primary"
                  : isRecurring
                    ? "bg-foreground dark:bg-secondary-foreground"
                    : "bg-foreground",
              )}
            >
              <Squircle className="relative mt-[15%] flex h-[85%] w-full items-center justify-center bg-background">
                <span className="text-foreground text-2xl font-bold tracking-tight">
                  {type.label}
                </span>
                {type.dots.map((top) => (
                  <Squircle
                    key={top}
                    className={cn(
                      "absolute right-[20%] h-[14%] w-[12%] transition-colors",
                      isSelected
                        ? "bg-primary"
                        : isRecurring
                          ? "bg-foreground dark:bg-secondary-foreground"
                          : "bg-foreground",
                    )}
                    style={{ top }}
                  />
                ))}
              </Squircle>
            </Squircle>
          )

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => form.setValue("eventType", type.value)}
              className="aspect-square"
            >
              {showBorder ? (
                <Squircle className="size-full bg-secondary p-px">
                  {inner}
                </Squircle>
              ) : inner}
            </button>
          )
        })}
      </div>
    </div>
  )
}
