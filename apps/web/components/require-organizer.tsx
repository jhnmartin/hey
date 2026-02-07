"use client"

import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function RequireOrganizer({ children }: { children: React.ReactNode }) {
  const profile = useQuery(api.profiles.get)
  const router = useRouter()

  useEffect(() => {
    if (profile !== undefined && profile?.role !== "organizer") {
      router.replace("/events")
    }
  }, [profile, router])

  if (profile === undefined) return null
  if (profile?.role !== "organizer") return null

  return <>{children}</>
}
