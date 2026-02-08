"use client"

import { useFormContext } from "react-hook-form"
import type { EventFormValues } from "./event-form-schema"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { IconEye, IconShieldCheck } from "@tabler/icons-react"

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground/60 text-[11px] leading-tight">
      {children}
    </p>
  )
}

export function StepClassification() {
  const form = useFormContext<EventFormValues>()
  const isFree = form.watch("isFreeEvent")

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Classification</h2>
        <p className="text-muted-foreground text-sm">
          A few quick decisions that shape the rest of the form.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Free / Paid */}
        <div className="bg-muted/30 rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-3">
            <Switch
              id="isFreeEvent"
              checked={isFree}
              onCheckedChange={(checked) => {
                form.setValue("isFreeEvent", checked)
                if (checked) {
                  const tickets = form.getValues("ticketTypes")
                  tickets.forEach((_, i) => {
                    form.setValue(`ticketTypes.${i}.price`, 0)
                  })
                }
              }}
            />
            <Label htmlFor="isFreeEvent" className="text-sm font-medium">
              {isFree ? "Free Event" : "Paid Event"}
            </Label>
          </div>
          <Hint>
            {isFree
              ? "No charge — you can still limit capacity per ticket type."
              : "Price fields will appear in the tickets step."}
          </Hint>
        </div>

        {/* Age Restriction */}
        <div className="bg-muted/30 rounded-lg border p-4">
          <div className="mb-1 flex items-center gap-2">
            <IconShieldCheck className="text-muted-foreground size-4" />
            <span className="text-sm font-medium">Age Restriction</span>
          </div>
          <Hint>Shown on the listing and enforced at check-in.</Hint>
          <div className="mt-2">
            <FormField
              control={form.control}
              name="ageRestriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Age Restriction</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all_ages">All Ages</SelectItem>
                      <SelectItem value="18_plus">18+</SelectItem>
                      <SelectItem value="21_plus">21+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-muted/30 rounded-lg border p-4">
          <div className="mb-1 flex items-center gap-2">
            <IconEye className="text-muted-foreground size-4" />
            <span className="text-sm font-medium">Visibility</span>
          </div>
          <Hint>
            Public events appear in search and recommendations. Private events need a direct link.
          </Hint>
          <div className="mt-2">
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
