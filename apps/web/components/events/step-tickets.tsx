"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import type { EventFormValues } from "./event-form-schema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { IconPlus, IconTrash } from "@tabler/icons-react"

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground/60 text-[11px] leading-tight">
      {children}
    </p>
  )
}

export function StepTickets() {
  const form = useFormContext<EventFormValues>()
  const isFree = form.watch("isFreeEvent")
  const eventType = form.watch("eventType")
  const isSeriesType = eventType === "recurring"

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ticketTypes",
  })

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Tickets</h2>
      {isSeriesType && (
        <div className="bg-muted/30 rounded-lg border p-3">
          <p className="text-muted-foreground text-sm">
            These tickets will be applied to each occurrence. Each event gets its own ticket pool with independent sold counts.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-muted/30 space-y-3 rounded-lg border p-3"
          >
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name={`ticketTypes.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Ticket name</FormLabel>
                    <Hint>A clear tier name — attendees choose between these.</Hint>
                    <FormControl>
                      <Input
                        placeholder={`Ticket ${index + 1} — e.g. General Admission`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground ml-2 shrink-0"
                  onClick={() => remove(index)}
                >
                  <IconTrash className="size-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {!isFree && (
                <FormField
                  control={form.control}
                  name={`ticketTypes.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (cents)</FormLabel>
                      <Hint>e.g. 2500 = $25.00</Hint>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name={`ticketTypes.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <Hint>Auto-marks sold out when reached.</Hint>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="100"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 1
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            clientId: crypto.randomUUID(),
            name: "",
            price: 0,
            quantity: 100,
            description: "",
          })
        }
      >
        <IconPlus className="mr-1.5 size-3.5" />
        Add Ticket Type
      </Button>
    </div>
  )
}
