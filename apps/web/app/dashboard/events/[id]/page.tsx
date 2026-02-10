"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { IconLoader2 } from "@tabler/icons-react"
import { SetPageTitle } from "@/components/page-title-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EventEditPage() {
  const { id } = useParams<{ id: string }>()
  const event = useQuery(api.events.get, id ? { id: id as any } : "skip")
  const updateEvent = useMutation(api.events.update)
  const publishEvent = useMutation(api.events.publish)
  const retryEnrichment = useMutation(api.events.retryEnrichment)

  // Editable fields
  const [name, setName] = useState("")
  const [tagline, setTagline] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [richDescription, setRichDescription] = useState("")
  const [schemaEventType, setSchemaEventType] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [visibility, setVisibility] = useState("")
  const [ageRestriction, setAgeRestriction] = useState("")
  const [capacity, setCapacity] = useState("")

  // Track which fields the user has manually edited
  const touched = useRef(new Set<string>())
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Initialize fields from query data, and reactively update untouched fields when AI completes
  useEffect(() => {
    if (!event) return

    if (!initialized) {
      setName(event.name ?? "")
      setTagline(event.tagline ?? "")
      setSeoTitle(event.seoTitle ?? "")
      setSeoDescription(event.seoDescription ?? "")
      setRichDescription(event.richDescription ?? "")
      setSchemaEventType(event.schemaEventType ?? "")
      setCategory(event.category ?? "")
      setTags(event.tags?.join(", ") ?? "")
      setVisibility(event.visibility ?? "public")
      setAgeRestriction(event.ageRestriction ?? "all_ages")
      setCapacity(event.capacity?.toString() ?? "")
      setInitialized(true)
    } else {
      // Reactively fill AI-generated fields the user hasn't touched
      if (!touched.current.has("seoTitle") && event.seoTitle) setSeoTitle(event.seoTitle)
      if (!touched.current.has("seoDescription") && event.seoDescription) setSeoDescription(event.seoDescription)
      if (!touched.current.has("richDescription") && event.richDescription) setRichDescription(event.richDescription)
      if (!touched.current.has("schemaEventType") && event.schemaEventType) setSchemaEventType(event.schemaEventType)
      if (!touched.current.has("category") && event.category) setCategory(event.category)
      if (!touched.current.has("tags") && event.tags?.length) setTags(event.tags.join(", "))
    }
  }, [event, initialized])

  const markTouched = (field: string) => {
    touched.current.add(field)
  }

  const handleSave = async () => {
    if (!event) return
    setSaving(true)
    try {
      await updateEvent({
        id: event._id,
        name: name.trim() || undefined,
        tagline: tagline.trim() || undefined,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        richDescription: richDescription.trim() || undefined,
        schemaEventType: schemaEventType || undefined,
        category: category.trim() || undefined,
        tags: tags.trim() ? tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : undefined,
        visibility: (visibility as "public" | "private") || undefined,
        ageRestriction: (ageRestriction as "all_ages" | "18_plus" | "21_plus") || undefined,
        capacity: capacity ? Number(capacity) : undefined,
      })
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!event) return
    setPublishing(true)
    try {
      // Save first, then publish
      await handleSave()
      await publishEvent({ id: event._id })
    } catch (error) {
      console.error("Failed to publish:", error)
    } finally {
      setPublishing(false)
    }
  }

  const handleRetry = async () => {
    if (!event) return
    await retryEnrichment({ id: event._id })
  }

  if (event === undefined) {
    return (
      <>
        <SetPageTitle title="Event" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </>
    )
  }

  if (event === null) {
    return (
      <>
        <SetPageTitle title="Event" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Event not found</p>
        </div>
      </>
    )
  }

  const aiStatus = event.aiEnrichmentStatus
  const venue = event.venues?.[0]

  return (
    <>
      <SetPageTitle title={event.name} />

      {/* Header with actions */}
      <div className="bg-background/80 sticky top-16 z-10 flex items-center justify-between py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2.5 py-0.5 text-xs font-medium capitalize ${event.status === "published" ? "bg-green-600/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
            {event.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          {event.status !== "published" && (
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>
      </div>

      {/* AI Status Banner */}
      {(aiStatus === "pending" || aiStatus === "processing") && (
        <div className="bg-muted/50 flex items-center gap-3 rounded-xl p-4">
          <IconLoader2 className="text-muted-foreground size-4 animate-spin" />
          <p className="text-muted-foreground text-sm">
            AI is analyzing your event and generating content...
          </p>
        </div>
      )}
      {aiStatus === "failed" && (
        <div className="bg-destructive/10 flex items-center justify-between rounded-xl p-4">
          <p className="text-destructive text-sm">
            AI enrichment failed. You can retry or fill in the fields manually.
          </p>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      )}

      {/* Event Info */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="mb-4 font-semibold">Event Info</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2 block text-sm font-medium">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => { markTouched("name"); setName(e.target.value) }}
            />
          </div>
          <div>
            <Label htmlFor="tagline" className="mb-2 block text-sm font-medium">Tagline</Label>
            <Input
              id="tagline"
              placeholder="A short tagline for your event"
              value={tagline}
              onChange={(e) => { markTouched("tagline"); setTagline(e.target.value) }}
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="mb-4 font-semibold">SEO</h3>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="seoTitle" className="text-sm font-medium">SEO Title</Label>
              <span className="text-muted-foreground text-xs">{seoTitle.length}/70</span>
            </div>
            <Input
              id="seoTitle"
              placeholder="SEO-optimized title for search engines"
              value={seoTitle}
              onChange={(e) => { markTouched("seoTitle"); setSeoTitle(e.target.value) }}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="seoDescription" className="text-sm font-medium">SEO Description</Label>
              <span className="text-muted-foreground text-xs">{seoDescription.length}/160</span>
            </div>
            <Textarea
              id="seoDescription"
              placeholder="Meta description for search results"
              rows={2}
              value={seoDescription}
              onChange={(e) => { markTouched("seoDescription"); setSeoDescription(e.target.value) }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="mb-4 font-semibold">Description</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="richDescription" className="mb-2 block text-sm font-medium">
              Marketing Description
            </Label>
            <p className="text-muted-foreground mb-2 text-xs">
              AI-generated from your summary. Edit as needed.
            </p>
            <Textarea
              id="richDescription"
              rows={8}
              value={richDescription}
              onChange={(e) => { markTouched("richDescription"); setRichDescription(e.target.value) }}
            />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="mb-4 font-semibold">Classification</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">Event Type (schema.org)</Label>
            <Select
              value={schemaEventType}
              onValueChange={(v) => { markTouched("schemaEventType"); setSchemaEventType(v) }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MusicEvent">Music Event</SelectItem>
                <SelectItem value="DanceEvent">Dance Event</SelectItem>
                <SelectItem value="Festival">Festival</SelectItem>
                <SelectItem value="SocialEvent">Social Event</SelectItem>
                <SelectItem value="ComedyEvent">Comedy Event</SelectItem>
                <SelectItem value="TheaterEvent">Theater Event</SelectItem>
                <SelectItem value="EducationEvent">Education Event</SelectItem>
                <SelectItem value="Event">Other Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category" className="mb-2 block text-sm font-medium">Category</Label>
            <Input
              id="category"
              placeholder="e.g. Live Music, DJ Night, Club Night"
              value={category}
              onChange={(e) => { markTouched("category"); setCategory(e.target.value) }}
            />
          </div>
          <div>
            <Label htmlFor="tags" className="mb-2 block text-sm font-medium">Tags</Label>
            <p className="text-muted-foreground mb-2 text-xs">Comma-separated discovery tags</p>
            <Input
              id="tags"
              placeholder="e.g. house music, downtown, late night"
              value={tags}
              onChange={(e) => { markTouched("tags"); setTags(e.target.value) }}
            />
          </div>
        </div>
      </div>

      {/* Date/Time */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="mb-4 font-semibold">Date & Time</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Start</p>
            <p className="font-medium">
              {event.startDate
                ? new Date(event.startDate).toLocaleString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                    hour: "numeric", minute: "2-digit",
                  })
                : "Not set"}
            </p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">End</p>
            <p className="font-medium">
              {event.endDate
                ? new Date(event.endDate).toLocaleString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                    hour: "numeric", minute: "2-digit",
                  })
                : "Not set"}
            </p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Doors Open</p>
            <p className="font-medium">
              {event.doorsOpen
                ? new Date(event.doorsOpen).toLocaleTimeString("en-US", {
                    hour: "numeric", minute: "2-digit",
                  })
                : "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Venue */}
      {venue && (
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="mb-4 font-semibold">Venue</h3>
          <p className="text-sm font-medium">{venue.name}</p>
          <p className="text-muted-foreground text-sm">
            {[venue.address, venue.city, venue.state, venue.zip].filter(Boolean).join(", ")}
          </p>
        </div>
      )}

      {/* Settings */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="mb-4 font-semibold">Settings</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label className="mb-2 block text-sm font-medium">Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) => { markTouched("visibility"); setVisibility(v) }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Age Restriction</Label>
            <Select
              value={ageRestriction}
              onValueChange={(v) => { markTouched("ageRestriction"); setAgeRestriction(v) }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_ages">All Ages</SelectItem>
                <SelectItem value="18_plus">18+</SelectItem>
                <SelectItem value="21_plus">21+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="capacity" className="mb-2 block text-sm font-medium">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="Max attendees"
              value={capacity}
              onChange={(e) => { markTouched("capacity"); setCapacity(e.target.value) }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
