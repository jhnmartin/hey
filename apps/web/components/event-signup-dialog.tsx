"use client"

import { useState, useCallback } from "react"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { IconEye, IconEyeOff, IconBrandGoogle, IconBrandApple } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type PendingAction = {
  type: "save" | "rsvp"
  eventId: string
}

type EventSignupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingAction: PendingAction | null
}

export function EventSignupDialog({
  open,
  onOpenChange,
  pendingAction,
}: EventSignupDialogProps) {
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn()
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp()
  const getOrCreate = useMutation(api.profiles.getOrCreate)
  const toggleSave = useMutation(api.savedEvents.toggle)
  const toggleRsvp = useMutation(api.rsvps.toggle)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isLoaded = signInLoaded && signUpLoaded

  function reset() {
    setEmail("")
    setPassword("")
    setShowPassword(false)
    setCode("")
    setVerifying(false)
    setError("")
    setLoading(false)
  }

  async function performPendingAction() {
    if (!pendingAction) return
    try {
      if (pendingAction.type === "save") {
        await toggleSave({ eventId: pendingAction.eventId as any })
      } else {
        await toggleRsvp({ eventId: pendingAction.eventId as any })
      }
    } catch {
      // Best-effort — event page will show correct state on next query
    }
  }

  async function finishAuth(sessionId: string, setActive: typeof setSignInActive) {
    await setActive!({ session: sessionId })
    await getOrCreate({ role: "attendee" })
    await performPendingAction()
    reset()
    onOpenChange(false)
  }

  const signUpWith = (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded) return
    if (pendingAction) {
      localStorage.setItem("pendingEventAction", JSON.stringify(pendingAction))
    }
    signUp.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/auth-callback?role=attendee",
    })
  }

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return
      setLoading(true)
      setError("")

      // Try login first
      try {
        const result = await signIn.create({
          identifier: email,
          password,
        })
        if (result.status === "complete") {
          await finishAuth(result.createdSessionId!, setSignInActive)
          return
        }
      } catch {
        // Login failed — fall through to signup
      }

      // Try signup
      try {
        await signUp.create({
          emailAddress: email,
          password,
        })
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        })
        setVerifying(true)
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? "Something went wrong")
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, email, password, pendingAction],
  )

  const onVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return
      setLoading(true)
      setError("")
      try {
        const result = await signUp.attemptEmailAddressVerification({ code })
        if (result.status === "complete") {
          await finishAuth(result.createdSessionId!, setSignUpActive)
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? "Verification failed")
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, code, pendingAction],
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join hey thursday</DialogTitle>
          <DialogDescription>
            Sign up to save and RSVP to events, get events in your area, and more.
          </DialogDescription>
        </DialogHeader>

        {verifying ? (
          <form onSubmit={onVerify} className="space-y-4">
            <p className="text-sm">
              We sent a verification code to <strong>{email}</strong>
            </p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <label className="text-sm font-medium">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-background mt-1 h-10 w-full rounded-md border px-3 text-center text-lg tracking-widest"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground flex h-10 w-full cursor-pointer items-center justify-center rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => signUpWith("oauth_google")}
                className="border-border flex h-10 flex-1 cursor-pointer items-center justify-center rounded-md border text-sm font-medium"
              >
                <IconBrandGoogle className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => signUpWith("oauth_apple")}
                className="border-border flex h-10 flex-1 cursor-pointer items-center justify-center rounded-md border text-sm font-medium"
              >
                <IconBrandApple className="size-5" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">or</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background mt-1 h-10 w-full rounded-md border px-3"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background h-10 w-full rounded-md border px-3 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute right-0 top-0 flex h-10 w-10 items-center justify-center"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <IconEyeOff className="size-4" />
                    ) : (
                      <IconEye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground flex h-10 w-full cursor-pointer items-center justify-center rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Continue"}
              </button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
