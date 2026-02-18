"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Suggestion = {
  placeId: string
  mainText: string
  secondaryText: string
  fullText: string
}

export type VenueResult = {
  placeId: string
  venueName: string
  address: string
  city: string
  state: string
  zip: string
  lat: number | null
  lng: number | null
}

type VenueAutocompleteProps = {
  defaultValue?: string
  onSelect: (result: VenueResult) => void
}

export function VenueAutocomplete({ defaultValue, onSelect }: VenueAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue ?? "")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
  }

  const handleSelect = async (suggestion: Suggestion) => {
    setQuery("")
    setOpen(false)
    setSuggestions([])

    try {
      const res = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}`,
      )
      const data = await res.json()
      onSelect({
        placeId: suggestion.placeId,
        venueName: data.name ?? suggestion.mainText,
        address: data.address ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        zip: data.zip ?? "",
        lat: data.lat ?? null,
        lng: data.lng ?? null,
      })
    } catch {
      onSelect({
        placeId: suggestion.placeId,
        venueName: suggestion.mainText,
        address: "",
        city: "",
        state: "",
        zip: "",
        lat: null,
        lng: null,
      })
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Search for a venue..."
      />

      {open && suggestions.length > 0 && (
        <div className="bg-popover border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-md border shadow-md">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              type="button"
              onClick={() => handleSelect(s)}
              className={cn(
                "hover:bg-accent w-full px-3 py-2 text-left",
              )}
            >
              <span className="text-sm font-medium">{s.mainText}</span>
              <span className="text-muted-foreground ml-1.5 text-xs">
                {s.secondaryText}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
