"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { api } from "@repo/backend/convex/_generated/api"

export default function AuthCallbackPage() {
  const { isSignedIn } = useAuth()
  const profile = useQuery(api.profiles.get)
  const router = useRouter()
  const [minTimePassed, setMinTimePassed] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!minTimePassed || !profile) return

    // Trigger fade out, then navigate
    setFadeOut(true)
    const timer = setTimeout(() => {
      if (profile.role === "organizer") {
        router.replace("/dashboard")
      } else {
        router.replace("/events")
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [minTimePassed, profile, router])

  // If somehow unauthenticated, bounce to login
  useEffect(() => {
    if (isSignedIn === false) {
      router.replace("/login")
    }
  }, [isSignedIn, router])

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
