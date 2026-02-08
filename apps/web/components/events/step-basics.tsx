"use client"

import { useFormContext } from "react-hook-form"
import type { EventFormValues } from "./event-form-schema"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/image-uploader"
import { TagInput } from "@/components/tag-input"
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

export function StepBasics() {
  const form = useFormContext<EventFormValues>()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left — cover image */}
      <ImageUploader
        storageId={form.watch("coverImageId")}
        onUpload={(id) => form.setValue("coverImageId", id)}
        onRemove={() => form.setValue("coverImageId", null)}
        className="aspect-square"
      />

      {/* Right — fields */}
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
                <div className="rounded-md border px-3 py-2 min-h-[88px]">
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
