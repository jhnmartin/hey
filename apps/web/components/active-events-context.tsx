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
import { getEventById } from "@/lib/dummy-events"
import type { DummyEvent } from "@/lib/dummy-events"

type ActiveEventsContextValue = {
  activeEvents: DummyEvent[]
  removeEvent: (id: string) => void
  clearAll: () => void
}

const ActiveEventsContext = createContext<ActiveEventsContextValue>({
  activeEvents: [],
  removeEvent: () => {},
  clearAll: () => {},
})

const EVENT_ROUTE_RE = /^\/dashboard\/events\/([^/]+)/

export function ActiveEventsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [activeEvents, setActiveEvents] = useState<DummyEvent[]>([])

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
  }, [])

  const clearAll = useCallback(() => {
    setSeenIds(new Set())
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

  // Rebuild active events list when seenIds changes
  useEffect(() => {
    const events: DummyEvent[] = []
    for (const id of seenIds) {
      const event = getEventById(id)
      if (event) events.push(event)
    }
    setActiveEvents(events)
  }, [seenIds])

  return (
    <ActiveEventsContext.Provider value={{ activeEvents, removeEvent, clearAll }}>
      {children}
    </ActiveEventsContext.Provider>
  )
}

export function useActiveEvents() {
  return useContext(ActiveEventsContext)
}
