"use client"

import { useQuery } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { api } from "@repo/backend/convex/_generated/api"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function RequireOrganizer({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const profile = useQuery(api.profiles.get)
  const memberships = useQuery(api.memberships.listByProfile)
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.replace("/login?role=organizer")
      return
    }

    if (profile !== undefined && profile?.role !== "organizer") {
      router.replace("/events")
      return
    }

    // Organizer with no memberships → must create or join an org
    if (
      profile?.role === "organizer" &&
      memberships !== undefined &&
      memberships.length === 0
    ) {
      router.replace("/onboarding/create-org")
    }
  }, [isSignedIn, isLoaded, profile, memberships, router])

  if (!isLoaded) return null
  if (!isSignedIn) return null
  if (profile === undefined) return null
  if (profile?.role !== "organizer") return null
  if (memberships === undefined) return null
  if (memberships.length === 0) return null

  return <>{children}</>
}
