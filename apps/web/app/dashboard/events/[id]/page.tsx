"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { ConvexError } from "convex/values"
import { format } from "date-fns"
import { IconCalendar, IconCrop, IconGripVertical, IconLoader2, IconPhoto, IconReplace, IconTrash, IconTrashX, IconX } from "@tabler/icons-react"
import { EventImageCropDialog } from "@/components/event-image-crop-dialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { VenueAutocomplete, type VenueResult } from "@/components/venue-autocomplete"
import { SetPageTitle } from "@/components/page-title-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { US_TIMEZONES, getBrowserTimezone } from "@/lib/timezones"
import { toast } from "sonner"

function tsToDate(ts?: number): Date | undefined {
  return ts ? new Date(ts) : undefined
}

function tsToTime(ts?: number): string {
  if (!ts) return ""
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function combineDateAndTime(date: Date, time: string): number {
  const d = new Date(date)
  if (time) {
    const [hours, minutes] = time.split(":").map(Number)
    d.setHours(hours!, minutes!, 0, 0)
  }
  return d.getTime()
}

type Venue = { name: string; address?: string; city?: string; state?: string; zip?: string; primary?: boolean }

function SortableVenueItem({
  venue,
  onRemove,
  onMakePrimary,
}: {
  venue: Venue
  onRemove: () => void
  onMakePrimary: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: venue.name })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-background flex items-center gap-3 rounded-md border px-3 py-2"
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{venue.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          {[venue.address, venue.city, venue.state, venue.zip].filter(Boolean).join(", ")}
        </p>
      </div>
      {venue.primary ? (
        <Badge variant="default" className="shrink-0">Primary</Badge>
      ) : (
        <button
          type="button"
          onClick={onMakePrimary}
          className="text-muted-foreground hover:text-foreground shrink-0 text-xs underline"
        >
          Make primary
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <IconX className="size-4" />
      </button>
    </div>
  )
}

export default function EventEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const event = useQuery(api.events.get, id ? { id: id as any } : "skip")
  const updateEvent = useMutation(api.events.update)
  const publishEvent = useMutation(api.events.publish)
  const deleteEvent = useMutation(api.events.remove)
  const retryEnrichment = useMutation(api.events.retryEnrichment)
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)

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
  const [venues, setVenues] = useState<Venue[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [endTime, setEndTime] = useState("")
  const [doorsTime, setDoorsTime] = useState("")
  const [showDoors, setShowDoors] = useState(false)
  const [timezone, setTimezone] = useState("")

  // Cover image state
  const [coverImageId, setCoverImageId] = useState<string | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null)
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  // Track which fields the user has manually edited
  const touched = useRef(new Set<string>())
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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
      setVenues(event.venues ?? [])
      setStartDate(tsToDate(event.startDate))
      setStartTime(tsToTime(event.startDate))
      if (event.endDate) {
        setEndDate(tsToDate(event.endDate))
        setEndTime(tsToTime(event.endDate))
      } else if (event.startDate) {
        const nextDay = new Date(event.startDate)
        nextDay.setDate(nextDay.getDate() + 1)
        nextDay.setHours(2, 0, 0, 0)
        setEndDate(nextDay)
        setEndTime("02:00")
      }
      setDoorsTime(tsToTime(event.doorsOpen))
      setShowDoors(!!event.doorsOpen)
      setTimezone(event.timezone ?? getBrowserTimezone())
      setCoverImageId(event.coverImageId ?? null)
      setCoverPreviewUrl(event.coverImageUrl ?? null)
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

  const handleCoverFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    if (file.size > 5 * 1024 * 1024) return
    // Revoke previous original if replacing
    if (originalImageSrc) URL.revokeObjectURL(originalImageSrc)
    const url = URL.createObjectURL(file)
    setOriginalImageSrc(url)
    setSelectedImageSrc(url)
    setCropDialogOpen(true)
  }, [originalImageSrc])

  const handleCropConfirm = useCallback(
    async (blob: Blob) => {
      setUploading(true)
      try {
        const url = await generateUploadUrl()
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        })
        const { storageId } = await result.json()
        setCoverImageId(storageId)
        setCoverPreviewUrl(URL.createObjectURL(blob))
      } catch (error) {
        console.error("Upload failed:", error)
      } finally {
        setUploading(false)
      }
    },
    [generateUploadUrl],
  )

  const handleEditCrop = useCallback(() => {
    if (!originalImageSrc) return
    setSelectedImageSrc(originalImageSrc)
    setCropDialogOpen(true)
  }, [originalImageSrc])

  const handleRemoveCover = useCallback(() => {
    if (originalImageSrc) URL.revokeObjectURL(originalImageSrc)
    setCoverImageId(null)
    setCoverPreviewUrl(null)
    setOriginalImageSrc(null)
  }, [originalImageSrc])

  const saveEvent = async () => {
    if (!event) throw new Error("No event")
    await updateEvent({
      id: event._id,
      name: name.trim() || undefined,
      tagline: tagline.trim() || undefined,
      ...(coverImageId ? { coverImageId: coverImageId as any } : {}),
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      richDescription: richDescription.trim() || undefined,
      schemaEventType: schemaEventType || undefined,
      category: category.trim() || undefined,
      tags: tags.trim() ? tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : undefined,
      visibility: (visibility as "public" | "private") || undefined,
      ageRestriction: (ageRestriction as "all_ages" | "18_plus" | "21_plus") || undefined,
      capacity: capacity ? Number(capacity) : undefined,
      timezone: timezone || undefined,
      startDate: startDate ? combineDateAndTime(startDate, startTime) : undefined,
      endDate: endDate ? combineDateAndTime(endDate, endTime) : undefined,
      doorsOpen: showDoors && doorsTime && startDate ? combineDateAndTime(startDate, doorsTime) : undefined,
      venues: venues.length > 0 ? venues.map((v) => ({
        name: v.name,
        address: v.address || undefined,
        city: v.city || undefined,
        state: v.state || undefined,
        zip: v.zip || undefined,
        primary: v.primary || undefined,
      })) : undefined,
    })
  }

  const handleSave = async () => {
    if (!event) return
    setSaving(true)
    try {
      await saveEvent()
      toast.success("Draft saved")
    } catch (error) {
      console.error("Failed to save:", error)
      toast.error("Failed to save event")
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!event) return
    setPublishing(true)
    try {
      await saveEvent()
      await publishEvent({ id: event._id })
      toast.success("Event published!")
    } catch (error) {
      const message = error instanceof ConvexError ? (error.data as string) : "Failed to publish"
      console.error("Failed to publish:", error)
      toast.error(message)
    } finally {
      setPublishing(false)
    }
  }

  const handleRetry = async () => {
    if (!event) return
    await retryEnrichment({ id: event._id })
  }

  const handleDelete = async () => {
    if (!event) return
    setDeleting(true)
    try {
      await deleteEvent({ id: event._id })
      toast.success("Event deleted")
      router.push("/dashboard/events")
    } catch (error) {
      const message = error instanceof ConvexError ? (error.data as string) : "Failed to delete event"
      toast.error(message)
      setDeleting(false)
    }
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

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return

    const oldIndex = venues.findIndex((v) => v.name === active.id)
    const newIndex = venues.findIndex((v) => v.name === over.id)
    const reordered = arrayMove(venues, oldIndex, newIndex).map((v, i) => ({
      ...v,
      primary: i === 0,
    }))
    setVenues(reordered)
  }

  const aiStatus = event.aiEnrichmentStatus

  return (
    <>
      <SetPageTitle title={event.name} />

      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2.5 py-0.5 text-xs font-medium capitalize ${event.status === "published" ? "bg-green-600/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
            {event.status}
          </span>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteDialogOpen(true)}>
            <IconTrashX className="size-4" />
          </Button>
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

      {/* Two-column grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column — image + main content */}
        <div className="space-y-4">
          {/* Cover Image */}
          {coverPreviewUrl ? (
            <div className="relative aspect-square overflow-hidden rounded-xl">
              <img
                src={coverPreviewUrl}
                alt=""
                className="size-full rounded-xl object-contain"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                {originalImageSrc && (
                  <button
                    type="button"
                    onClick={handleEditCrop}
                    className="bg-background/80 hover:bg-background rounded-full p-1.5"
                    title="Edit crop"
                  >
                    <IconCrop className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="bg-background/80 hover:bg-background rounded-full p-1.5"
                  title="Replace image"
                >
                  <IconReplace className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="bg-background/80 hover:bg-background rounded-full p-1.5"
                  title="Remove image"
                >
                  <IconTrash className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => coverInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") coverInputRef.current?.click()
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file) handleCoverFile(file)
              }}
              className={cn(
                "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                uploading && "pointer-events-none opacity-50",
              )}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <IconLoader2 className="text-muted-foreground size-5 animate-spin" />
                  <p className="text-muted-foreground text-sm">Uploading...</p>
                </div>
              ) : (
                <>
                  <IconPhoto className="text-muted-foreground mb-2 size-10" />
                  <p className="text-muted-foreground text-sm">Click or drag to upload cover image</p>
                  <p className="text-muted-foreground/60 mt-1 text-xs">Recommended: 1080 × 1080 · Max 5MB</p>
                </>
              )}
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleCoverFile(file)
              e.target.value = ""
            }}
          />
          {selectedImageSrc && (
            <EventImageCropDialog
              open={cropDialogOpen}
              onOpenChange={setCropDialogOpen}
              imageSrc={selectedImageSrc}
              onConfirm={handleCropConfirm}
            />
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
                <Label htmlFor="tagline" className="mb-2 block text-sm font-medium">Short Description</Label>
                <Input
                  id="tagline"
                  placeholder="A short description for your event"
                  value={tagline}
                  onChange={(e) => { markTouched("tagline"); setTagline(e.target.value) }}
                />
              </div>
            </div>
          </div>

          {/* Venues */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Venues</h3>
            <div className="space-y-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={venues.map((v) => v.name)}
                  strategy={verticalListSortingStrategy}
                >
                  {venues.map((v, i) => (
                    <SortableVenueItem
                      key={v.name}
                      venue={v}
                      onRemove={() => {
                        const remaining = venues.filter((_, j) => j !== i)
                        if (v.primary && remaining.length > 0) {
                          remaining[0] = { ...remaining[0]!, primary: true }
                        }
                        setVenues(remaining)
                      }}
                      onMakePrimary={() => {
                        const updated = venues.map((venue, j) => ({
                          ...venue,
                          primary: j === i,
                        }))
                        const newPrimary = updated[i]!
                        const rest = updated.filter((_, j) => j !== i)
                        setVenues([newPrimary, ...rest])
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <VenueAutocomplete
                onSelect={(result) => {
                  setVenues([...venues, {
                    name: result.venueName,
                    address: result.address,
                    city: result.city,
                    state: result.state,
                    zip: result.zip,
                    primary: venues.length === 0,
                  }])
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Description</h3>
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
        </div>

        {/* Right column — metadata */}
        <div className="space-y-4">
          {/* Date/Time */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Date & Time</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
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
                <div className="w-28">
                  <Label className="mb-2 block text-sm font-medium">Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
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
                <div className="w-28">
                  <Label className="mb-2 block text-sm font-medium">Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              {showDoors ? (
                <div>
                  <Label className="mb-2 block text-sm font-medium">Doors Open</Label>
                  <Input
                    type="time"
                    value={doorsTime}
                    onChange={(e) => setDoorsTime(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => { setShowDoors(false); setDoorsTime("") }}
                    className="text-muted-foreground hover:text-foreground mt-2 text-xs underline"
                  >
                    Remove door time
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDoors(true)}
                  className="text-muted-foreground hover:text-foreground text-sm underline"
                >
                  + Set door time
                </button>
              )}
              <div>
                <Label className="mb-2 block text-sm font-medium">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {US_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Classification</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Event Type</Label>
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
                  placeholder="e.g. Live Music, DJ Night"
                  value={category}
                  onChange={(e) => { markTouched("category"); setCategory(e.target.value) }}
                />
              </div>
              <div>
                <Label htmlFor="tags" className="mb-2 block text-sm font-medium">Tags</Label>
                <p className="text-muted-foreground mb-2 text-xs">Comma-separated</p>
                <Input
                  id="tags"
                  placeholder="e.g. house music, downtown"
                  value={tags}
                  onChange={(e) => { markTouched("tags"); setTags(e.target.value) }}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Settings</h3>
            <div className="space-y-4">
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
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{event.name}&quot; and all associated data including tickets, RSVPs, and collaborators. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
