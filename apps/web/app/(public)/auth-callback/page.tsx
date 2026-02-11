"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useConvexAuth } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"

export default function AuthCallbackPage() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const profile = useQuery(api.profiles.get)
  const memberships = useQuery(api.memberships.listByProfile)
  const pendingInvites = useQuery(api.invites.listPendingForEmail)
  const getOrCreate = useMutation(api.profiles.getOrCreate)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minTimePassed, setMinTimePassed] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const ensuredProfile = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Ensure profile exists (handles OAuth users who skip signup's getOrCreate call)
  useEffect(() => {
    if (isAuthenticated && profile === null && !ensuredProfile.current) {
      ensuredProfile.current = true
      const role = searchParams.get("role")
      getOrCreate(
        role === "organizer" ? { role: "organizer" } : { role: "attendee" },
      )
    }
  }, [isAuthenticated, profile, searchParams, getOrCreate])

  useEffect(() => {
    if (!minTimePassed || !profile) return
    // Wait for membership/invite data for organizers
    if (
      profile.role === "organizer" &&
      (memberships === undefined || pendingInvites === undefined)
    ) {
      return
    }

    setFadeOut(true)
    const timer = setTimeout(() => {
      if (profile.role !== "organizer") {
        router.replace("/events")
        return
      }

      // Organizer routing: memberships → dashboard, invites → onboarding, else → create org
      if (memberships && memberships.length > 0) {
        router.replace("/dashboard")
      } else if (pendingInvites && pendingInvites.length > 0) {
        router.replace("/onboarding/invites")
      } else {
        router.replace("/onboarding/create-org")
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [minTimePassed, profile, memberships, pendingInvites, router])

  // If unauthenticated after Convex auth finishes loading, bounce to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, router])

  return (
    <div
      className={`flex min-h-[70vh] flex-col items-center justify-center transition-opacity duration-300 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="bg-foreground h-8 w-8 animate-spin rounded-sm" />
        <p className="text-muted-foreground text-sm">Setting things up...</p>
      </div>
    </div>
  )
}
