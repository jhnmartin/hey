"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

type TagInputProps = {
  value: string[]
  onChange: (tags: string[]) => void
  max?: number
}

export function TagInput({ value, onChange, max = 3 }: TagInputProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const createTag = useMutation(api.eventTags.create)

  const results = useQuery(api.eventTags.search, { query })

  // Filter out already-selected tags
  const suggestions = (results ?? []).filter(
    (tag) => !value.includes(tag.name),
  )

  const addTag = useCallback(
    (name: string) => {
      const normalized = name.trim().toLowerCase()
      if (!normalized || value.includes(normalized) || value.length >= max) return
      onChange([...value, normalized])
      setQuery("")
      setOpen(false)
      inputRef.current?.focus()
    },
    [value, onChange, max],
  )

  const removeTag = (name: string) => {
    onChange(value.filter((t) => t !== name))
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault()
      // Create tag if it doesn't exist, then add
      await createTag({ name: query.trim() })
      addTag(query.trim())
    }
    if (e.key === "Backspace" && !query && value.length > 0) {
      removeTag(value[value.length - 1]!)
    }
    if (e.key === "Escape") {
      setOpen(false)
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

  const atMax = value.length >= max

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-foreground ml-0.5"
            >
              <IconX className="size-3" />
            </button>
          </Badge>
        ))}
        {!atMax && (
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? "Search or create tags..." : "Add another..."}
            className="h-8 min-w-[140px] flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
          />
        )}
      </div>

      {/* Dropdown */}
      {open && !atMax && (
        <div className="bg-popover border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-md border shadow-md">
          {suggestions.length > 0 ? (
            suggestions.map((tag) => (
              <button
                key={tag._id}
                type="button"
                onClick={() => {
                  addTag(tag.name)
                }}
                className="hover:bg-accent w-full px-3 py-1.5 text-left text-sm"
              >
                {tag.name}
              </button>
            ))
          ) : query.trim() ? (
            <button
              type="button"
              onClick={async () => {
                await createTag({ name: query.trim() })
                addTag(query.trim())
              }}
              className="hover:bg-accent text-muted-foreground w-full px-3 py-1.5 text-left text-sm"
            >
              Create &ldquo;{query.trim().toLowerCase()}&rdquo;
            </button>
          ) : (
            <p className="text-muted-foreground px-3 py-1.5 text-sm">
              Start typing to search or create tags
            </p>
          )}
        </div>
      )}
    </div>
  )
}
