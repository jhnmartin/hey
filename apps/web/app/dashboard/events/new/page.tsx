"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@repo/backend/convex/_generated/api"
import { IconCalendar, IconMapPin, IconX } from "@tabler/icons-react"
import { SetPageTitle } from "@/components/page-title-context"
import { useOrg } from "@/components/org-context"
import { VenueAutocomplete, type VenueResult } from "@/components/venue-autocomplete"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function combineDateAndTime(date: Date, time: string): number {
  const d = new Date(date)
  if (time) {
    const [hours, minutes] = time.split(":").map(Number)
    d.setHours(hours!, minutes!, 0, 0)
  }
  return d.getTime()
}

export default function CreateEventPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState("")
  const [venue, setVenue] = useState<VenueResult | null>(null)
  const [showEndDate, setShowEndDate] = useState(false)
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [endTime, setEndTime] = useState("")
  const [recurring, setRecurring] = useState(false)
  const [saving, setSaving] = useState(false)

  const { activeOrg } = useOrg()
  const createEvent = useMutation(api.events.create)
  const router = useRouter()

  const canSave = name.trim() !== "" && activeOrg !== null

  const handleSave = async () => {
    if (!canSave || !activeOrg) return
    setSaving(true)
    try {
      const eventId = await createEvent({
        name: name.trim(),
        status: "draft",
        visibility: "public",
        ageRestriction: "all_ages",
        eventType: recurring ? "recurring" : "single",
        ownerOrgId: activeOrg._id,
        ...(startDate && { startDate: combineDateAndTime(startDate, startTime) }),
        ...(showEndDate && endDate && { endDate: combineDateAndTime(endDate, endTime) }),
        ...(venue && {
          venues: [{
            name: venue.venueName,
            address: venue.address,
            city: venue.city,
            state: venue.state,
            zip: venue.zip,
          }],
        }),
      })
      router.push(`/dashboard/events/${eventId}`)
    } catch (error) {
      console.error("Failed to create event:", error)
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <SetPageTitle title="Create Event" />
      <div className="bg-background/80 sticky top-16 z-10 flex items-center justify-between py-4 backdrop-blur-sm">
        <h1 className="text-5xl font-bold">get started</h1>
        <Button onClick={handleSave} disabled={!canSave || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <div className="w-full space-y-4">
        <div className="bg-muted/50 rounded-xl p-6">
          <Label htmlFor="event-name" className="mb-2 block text-sm font-medium">
            Event Name
          </Label>
          <Input
            id="event-name"
            placeholder="What's your event called?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="mb-2 block text-sm font-medium">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <IconCalendar className="mr-2 size-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-36">
              <Label htmlFor="start-time" className="mb-2 block text-sm font-medium">Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          {showEndDate && (
            <div className="mt-4 flex items-end gap-4">
              <div className="flex-1">
                <Label className="mb-2 block text-sm font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <IconCalendar className="mr-2 size-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-36">
                <Label htmlFor="end-time" className="mb-2 block text-sm font-medium">Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => { setShowEndDate(false); setEndDate(undefined); setEndTime("") }}
              >
                <IconX className="size-4" />
              </Button>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="recurring-toggle" className="text-muted-foreground text-xs">
                {recurring && startDate
                  ? `Repeats every ${format(startDate, "EEEE")} (weekly)`
                  : "Recurring (weekly)"}
              </Label>
              <Switch
                id="recurring-toggle"
                checked={recurring}
                onCheckedChange={setRecurring}
              />
            </div>
            {!showEndDate && (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => setShowEndDate(true)}
              >
                + Add end date and time
              </Button>
            )}
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <Label className="mb-1 block text-sm font-medium">Primary Location</Label>
          <p className="text-muted-foreground mb-2 text-xs">You can add more venues later</p>
          {venue ? (
            <div className="bg-background flex items-center gap-3 rounded-md border px-3 py-2">
              <IconMapPin className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{venue.venueName}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {[venue.address, venue.city, venue.state, venue.zip].filter(Boolean).join(", ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVenue(null)}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <IconX className="size-4" />
              </button>
            </div>
          ) : (
            <VenueAutocomplete onSelect={setVenue} />
          )}
        </div>
        <div className="bg-muted/50 rounded-xl p-6">
          <Label htmlFor="event-description" className="mb-1 block text-sm font-medium">
            Event Description
          </Label>
          <p className="text-muted-foreground mb-2 text-xs">
            Add all relevant information about your event, we&apos;ll take it from there. You can edit details after your event is created.
          </p>
          <Textarea
            id="event-description"
            placeholder="Tell people what your event is about..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
