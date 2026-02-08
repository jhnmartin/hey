"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { Button } from "@/components/ui/button"
import type { Id } from "@repo/backend/convex/_generated/dataModel"

export default function OnboardingInvitesPage() {
  const router = useRouter()
  const pendingInvites = useQuery(api.invites.listPendingForEmail)
  const acceptInvite = useMutation(api.invites.accept)
  const declineInvite = useMutation(api.invites.decline)

  const [resolving, setResolving] = useState<Set<string>>(new Set())
  const [accepted, setAccepted] = useState<Set<string>>(new Set())
  const [declined, setDeclined] = useState<Set<string>>(new Set())
  const [lastAccepted, setLastAccepted] = useState<{
    orgId: string
    orgName: string
  } | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  // Transition screen auto-redirect
  useEffect(() => {
    if (!transitioning || !lastAccepted) return
    const timer = setTimeout(() => {
      router.push(`/dashboard?org=${lastAccepted.orgId}`)
    }, 2000)
    return () => clearTimeout(timer)
  }, [transitioning, lastAccepted, router])

  if (pendingInvites === undefined) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <div className="bg-foreground h-8 w-8 animate-spin rounded-sm" />
      </div>
    )
  }

  // Transition screen
  if (transitioning && lastAccepted) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-foreground h-8 w-8 animate-spin rounded-sm" />
          <p className="text-foreground font-medium">
            Taking you to {lastAccepted.orgName}...
          </p>
          <p className="text-muted-foreground text-sm">
            You can find future invites in your notifications.
          </p>
        </div>
      </div>
    )
  }

  const hasAccepted = accepted.size > 0

  async function handleAccept(
    inviteId: Id<"invites">,
    orgId: string,
    orgName: string,
  ) {
    setResolving((s) => new Set(s).add(inviteId))
    await acceptInvite({ inviteId })
    setAccepted((s) => new Set(s).add(inviteId))
    setLastAccepted({ orgId, orgName })
    setResolving((s) => {
      const next = new Set(s)
      next.delete(inviteId)
      return next
    })
  }

  async function handleDecline(inviteId: Id<"invites">) {
    setResolving((s) => new Set(s).add(inviteId))
    await declineInvite({ inviteId })
    setDeclined((s) => new Set(s).add(inviteId))
    setResolving((s) => {
      const next = new Set(s)
      next.delete(inviteId)
      return next
    })
  }

  function handleGoToDashboard() {
    if (lastAccepted) {
      setTransitioning(true)
    } else {
      router.push("/onboarding/create-org")
    }
  }

  const allResolved =
    pendingInvites.length > 0 &&
    pendingInvites.every(
      (item) =>
        accepted.has(item.invite._id) || declined.has(item.invite._id),
    )

  // If all resolved and none accepted, go to create-org
  const allDeclined = allResolved && accepted.size === 0

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-2xl font-bold">Pending Invites</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          You&apos;ve been invited to join the following organizations.
        </p>

        <div className="bg-muted/50 rounded-xl">
          {pendingInvites.map((item) => {
            const isAccepted = accepted.has(item.invite._id)
            const isDeclined = declined.has(item.invite._id)
            const isResolving = resolving.has(item.invite._id)
            const isResolved = isAccepted || isDeclined

            return (
              <div
                key={item.invite._id}
                className="flex items-center justify-between border-b p-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{item.org.name}</p>
                  <p className="text-muted-foreground text-sm capitalize">
                    {item.org.role} &middot; Invited as {item.invite.role}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isResolved ? (
                    <span className="text-muted-foreground text-sm">
                      {isAccepted ? "Accepted" : "Declined"}
                    </span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isResolving}
                        onClick={() => handleDecline(item.invite._id)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        disabled={isResolving}
                        onClick={() =>
                          handleAccept(
                            item.invite._id,
                            item.org._id,
                            item.org.name,
                          )
                        }
                      >
                        Accept
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {allDeclined ? (
            <Button
              onClick={() => router.push("/onboarding/create-org")}
              className="w-full"
            >
              Create your own organization
            </Button>
          ) : hasAccepted ? (
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to {lastAccepted?.orgName} dashboard
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/onboarding/create-org")}
            >
              Skip &amp; create my own organization
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
