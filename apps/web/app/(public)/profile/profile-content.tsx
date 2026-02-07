"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileContent() {
  const profile = useQuery(api.profiles.get)
  const seed = useMutation(api.profiles.seed)

  useEffect(() => {
    void seed()
  }, [seed])

  if (profile === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-32" />
        <div className="mt-6 flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
    )
  }

  if (profile === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-4">No profile found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="text-xl font-bold">
            {getInitials(profile.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">{profile.name}</p>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
          {profile.city && (
            <p className="text-muted-foreground text-sm">{profile.city}</p>
          )}
        </div>
      </div>
      {profile.bio && (
        <p className="text-muted-foreground mt-4 text-sm">{profile.bio}</p>
      )}
      <div className="bg-muted/50 mt-8 rounded-xl p-6">
        <h2 className="font-semibold">Upcoming Events</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          You have 2 upcoming events. Check your tickets for details.
        </p>
      </div>
      <div className="bg-muted/50 mt-4 rounded-xl p-6">
        <h2 className="font-semibold">Event History</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Past events will appear here.
        </p>
      </div>
    </div>
  )
}
