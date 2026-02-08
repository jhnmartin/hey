"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"

export type ActiveEvent = {
  id: string
  name: string
}

type ActiveEventsContextValue = {
  activeEvents: ActiveEvent[]
  removeEvent: (id: string) => void
  clearAll: () => void
}

const ActiveEventsContext = createContext<ActiveEventsContextValue>({
  activeEvents: [],
  removeEvent: () => {},
  clearAll: () => {},
})

const EVENT_ROUTE_RE = /^\/dashboard\/events\/([^/]+)/

function ActiveEventLoader({
  eventId,
  onLoaded,
}: {
  eventId: string
  onLoaded: (id: string, name: string) => void
}) {
  const event = useQuery(api.events.get, { id: eventId as any })

  useEffect(() => {
    if (event) {
      onLoaded(eventId, event.name)
    }
  }, [event, eventId, onLoaded])

  return null
}

export function ActiveEventsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [eventNames, setEventNames] = useState<Map<string, string>>(new Map())

  const addEvent = useCallback((id: string) => {
    setSeenIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const removeEvent = useCallback((id: string) => {
    setSeenIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setEventNames((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setSeenIds(new Set())
    setEventNames(new Map())
  }, [])

  // Watch pathname and register event visits
  useEffect(() => {
    const match = EVENT_ROUTE_RE.exec(pathname)
    if (match) {
      const id = match[1]!
      if (id !== "new") {
        addEvent(id)
      }
    }
  }, [pathname, addEvent])

  const handleEventLoaded = useCallback((id: string, name: string) => {
    setEventNames((prev) => {
      if (prev.get(id) === name) return prev
      const next = new Map(prev)
      next.set(id, name)
      return next
    })
  }, [])

  const activeEvents: ActiveEvent[] = []
  for (const id of seenIds) {
    const name = eventNames.get(id)
    if (name) {
      activeEvents.push({ id, name })
    }
  }

  // IDs that still need their name fetched
  const pendingIds = [...seenIds].filter((id) => !eventNames.has(id))

  return (
    <ActiveEventsContext.Provider value={{ activeEvents, removeEvent, clearAll }}>
      {pendingIds.map((id) => (
        <ActiveEventLoader key={id} eventId={id} onLoaded={handleEventLoaded} />
      ))}
      {children}
    </ActiveEventsContext.Provider>
  )
}

export function useActiveEvents() {
  return useContext(ActiveEventsContext)
}
