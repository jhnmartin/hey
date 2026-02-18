"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useLocation, type LocationSource } from "@/lib/location-context"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconMapPin,
  IconCurrentLocation,
  IconSearch,
  IconHome,
  IconChevronDown,
  IconLoader2,
} from "@tabler/icons-react"
import Link from "next/link"

const RADIUS_OPTIONS = [10, 25, 50, 100] as const

export function LocationBar() {
  const { location, setSource, setSelected, setRadius, requestCurrentLocation, locationLoading } = useLocation()
  const profile = useQuery(api.profiles.get)
  const hasHome = profile?.homeLat != null && profile?.homeLng != null
  const [open, setOpen] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ placeId: string; mainText: string; secondaryText: string }[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) { setSuggestions([]); return }
    setSearching(true)
    try {
      const res = await fetch("/api/places/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
    } catch {
      setSuggestions([])
    } finally {
      setSearching(false)
    }
  }, [])

  function handleSearchChange(val: string) {
    setSearchQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  async function handleSearchSelect(placeId: string, mainText: string) {
    setSuggestions([])
    setSearchQuery("")
    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`)
      const data = await res.json()
      const name = [data.city, data.state].filter(Boolean).join(", ") || mainText
      if (data.lat != null && data.lng != null) {
        setSelected(name, data.lat, data.lng)
        setOpen(false)
      }
    } catch { /* ignore */ }
  }

  const displayName = location.name || "Set location"
  const sourceLabel = location.source === "home" ? " (Home)" : location.source === "current" ? "" : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors"
        >
          {locationLoading ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconMapPin className="size-4" />
          )}
          <span>
            {displayName}{sourceLabel}
            {location.lat != null && <span className="text-muted-foreground/60"> · {location.radiusMiles} mi</span>}
          </span>
          <IconChevronDown className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="space-y-1 p-3">
          <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">Location</p>

          {/* Home option */}
          <button
            type="button"
            disabled={!hasHome}
            onClick={() => { setSource("home"); setOpen(false) }}
            className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm disabled:opacity-50"
          >
            <IconHome className="size-4" />
            <span className="flex-1">
              {hasHome ? (profile?.homeLocationName ?? "Home") : "Home"}
            </span>
            {!hasHome && (
              <Link
                href="/profile"
                className="text-primary text-xs hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Set up
              </Link>
            )}
            {location.source === "home" && location.lat != null && (
              <span className="bg-primary size-1.5 rounded-full" />
            )}
          </button>

          {/* Current location */}
          <button
            type="button"
            onClick={() => { requestCurrentLocation(); setOpen(false) }}
            className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
          >
            <IconCurrentLocation className="size-4" />
            <span className="flex-1">Current Location</span>
            {location.source === "current" && location.lat != null && (
              <span className="bg-primary size-1.5 rounded-full" />
            )}
          </button>

          {/* Search */}
          <div className="pt-1">
            <div className="relative">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search a city..."
                className="h-8 pl-7 text-sm"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="mt-1 max-h-36 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.placeId}
                    type="button"
                    onClick={() => handleSearchSelect(s.placeId, s.mainText)}
                    className="hover:bg-accent w-full rounded px-2 py-1.5 text-left"
                  >
                    <span className="text-sm">{s.mainText}</span>
                    <span className="text-muted-foreground ml-1 text-xs">{s.secondaryText}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Radius presets */}
        <div className="border-t px-3 py-2">
          <p className="text-muted-foreground mb-1.5 text-xs font-medium uppercase tracking-wider">Radius</p>
          <div className="flex gap-1">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  location.radiusMiles === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
