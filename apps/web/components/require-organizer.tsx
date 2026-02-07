"use client"

import { useQuery } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { api } from "@repo/backend/convex/_generated/api"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function RequireOrganizer({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const profile = useQuery(api.profiles.get)
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.replace("/login?role=organizer")
      return
    }

    if (profile !== undefined && profile?.role !== "organizer") {
      router.replace("/events")
    }
  }, [isSignedIn, isLoaded, profile, router])

  if (!isLoaded) return null
  if (!isSignedIn) return null
  if (profile === undefined) return null
  if (profile?.role !== "organizer") return null

  return <>{children}</>
}
