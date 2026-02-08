"use client"

import { useFormContext } from "react-hook-form"
import type { EventFormValues } from "./event-form-schema"
import { Input } from "@/components/ui/input"
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
import { IconEye, IconUsers } from "@tabler/icons-react"

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground/60 text-[11px] leading-tight">
      {children}
    </p>
  )
}

export function StepSettings() {
  const form = useFormContext<EventFormValues>()

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-muted/30 rounded-lg border p-4">
        <div className="mb-1 flex items-center gap-2">
          <IconEye className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">Visibility</span>
        </div>
        <Hint>
          Public events appear in search, feeds, and recommendations. Private events need a direct link.
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

      <div className="bg-muted/30 rounded-lg border p-4">
        <div className="mb-1 flex items-center gap-2">
          <IconUsers className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">Capacity</span>
        </div>
        <Hint>
          Overall venue cap. Shows sold out when reached, regardless of ticket inventory. Empty = no cap.
        </Hint>
        <div className="mt-2">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Leave empty for unlimited"
                    value={field.value === "" || field.value === undefined ? "" : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
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
    </div>
  )
}
