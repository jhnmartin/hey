"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { AvatarUploader } from "@/components/avatar-uploader"
import { IconMapPin, IconX } from "@tabler/icons-react"

function LocationAutocomplete({
  value,
  onChange,
}: {
  value: string
  onChange: (result: { name: string; lat: number; lng: number } | null) => void
}) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ placeId: string; mainText: string; secondaryText: string }[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) { setSuggestions([]); return }
    try {
      const res = await fetch("/api/places/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
      setOpen(true)
    } catch {
      setSuggestions([])
    }
  }, [])

  function handleChange(val: string) {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  async function handleSelect(placeId: string) {
    setOpen(false)
    setSuggestions([])
    setQuery("")
    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`)
      const data = await res.json()
      const name = [data.city, data.state].filter(Boolean).join(", ") || data.formattedAddress || ""
      if (data.lat != null && data.lng != null) {
        onChange({ name, lat: data.lat, lng: data.lng })
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="bg-muted flex items-center gap-2 rounded-md px-3 py-2">
          <IconMapPin className="text-muted-foreground size-4 shrink-0" />
          <span className="flex-1 text-sm">{value}</span>
          <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-foreground">
            <IconX className="size-3.5" />
          </button>
        </div>
      ) : (
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search for a city..."
        />
      )}
      {open && suggestions.length > 0 && (
        <div className="bg-popover border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-md border shadow-md">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              type="button"
              onClick={() => handleSelect(s.placeId)}
              className="hover:bg-accent w-full px-3 py-2 text-left"
            >
              <span className="text-sm font-medium">{s.mainText}</span>
              <span className="text-muted-foreground ml-1.5 text-xs">{s.secondaryText}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProfileForm() {
  const profile = useQuery(api.profiles.get)
  const updateProfile = useMutation(api.profiles.update)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [bio, setBio] = useState("")
  const [avatarStorageId, setAvatarStorageId] = useState<string | null>(null)
  const [homeLat, setHomeLat] = useState<number | undefined>()
  const [homeLng, setHomeLng] = useState<number | undefined>()
  const [homeLocationName, setHomeLocationName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setEmail(profile.email)
      setPhone(profile.phone ?? "")
      setCity(profile.city ?? "")
      setDateOfBirth(profile.dateOfBirth ?? "")
      setBio(profile.bio ?? "")
      setAvatarStorageId(profile.avatarStorageId ?? null)
      setHomeLat(profile.homeLat)
      setHomeLng(profile.homeLng)
      setHomeLocationName(profile.homeLocationName ?? "")
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const [result] = await Promise.all([
      updateProfile({
        id: profile._id,
        name,
        email,
        phone,
        city,
        dateOfBirth,
        bio,
        ...(avatarStorageId ? { avatarStorageId: avatarStorageId as any } : {}),
        ...(homeLat != null ? { homeLat } : {}),
        ...(homeLng != null ? { homeLng } : {}),
        ...(homeLocationName ? { homeLocationName } : {}),
      }),
      new Promise((r) => setTimeout(r, 1000)),
    ])
    setSaving(false)
  }

  if (profile === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="bg-muted/50 rounded-xl p-6">
      <h2 className="font-semibold">Profile</h2>
      <div className="mt-4 space-y-3">
        <div className="flex justify-center">
          <AvatarUploader
            storageId={avatarStorageId}
            onUpload={setAvatarStorageId}
            name={name}
          />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Home Location</Label>
          <p className="text-muted-foreground mb-1 text-xs">Used for nearby event discovery</p>
          <LocationAutocomplete
            value={homeLocationName}
            onChange={(result) => {
              if (result) {
                setHomeLat(result.lat)
                setHomeLng(result.lng)
                setHomeLocationName(result.name)
                if (!city) setCity(result.name.split(",")[0]?.trim() ?? "")
              } else {
                setHomeLat(undefined)
                setHomeLng(undefined)
                setHomeLocationName("")
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
