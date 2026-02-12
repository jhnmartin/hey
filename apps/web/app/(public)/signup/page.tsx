"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
import { IconEye, IconEyeOff } from "@tabler/icons-react"

type Role = "attendee" | "organizer"

export default function SignupPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialRole = (searchParams.get("role") as Role) ?? null
  const [role, setRole] = useState<Role | null>(initialRole)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const resendTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (resendCountdown <= 0) {
      if (resendTimer.current) clearInterval(resendTimer.current)
      return
    }
    resendTimer.current = setInterval(() => {
      setResendCountdown((c) => c - 1)
    }, 1000)
    return () => { if (resendTimer.current) clearInterval(resendTimer.current) }
  }, [resendCountdown > 0])

  const signUpWith = (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded || !role) return
    signUp.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: `/auth-callback?role=${role}`,
    })
  }

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isLoaded || !role) return
      setLoading(true)
      setError("")
      try {
        const [firstName, ...rest] = name.split(" ")
        const result = await signUp.create({
          firstName: firstName ?? "",
          lastName: rest.join(" "),
          emailAddress: email,
          password,
        })

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId })
          router.push(`/auth-callback?role=${role}`)
          return
        }

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        })
        setResendCountdown(30)
        setVerifying(true)
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? "Sign up failed")
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, name, email, password, role],
  )

  const onVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isLoaded || !role) return
      setLoading(true)
      setError("")
      try {
        const result = await signUp.attemptEmailAddressVerification({ code })

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId })
          router.push(`/auth-callback?role=${role}`)
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? "Verification failed")
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, code, role],
  )

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        Join hey thursday to discover events and never miss a night out.
      </p>

      {verifying ? (
        <form onSubmit={onVerify} className="mt-8 w-full space-y-4">
          <p className="text-sm">
            We sent a verification code to <strong>{email}</strong>
          </p>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Verification Code</label>
              {resendCountdown > 0 ? (
                <span className="text-destructive text-xs">{resendCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" })
                      setResendCountdown(30)
                      setError("")
                    } catch (err: any) {
                      setError(err.errors?.[0]?.longMessage ?? "Failed to resend code")
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Resend code
                </button>
              )}
            </div>
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
            className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      ) : !role ? (
        <div className="mt-8 w-full space-y-3">
          <p className="text-sm font-medium">I want to...</p>
          <button
            onClick={() => setRole("attendee")}
            className="border-border hover:border-foreground w-full rounded-lg border p-4 text-left transition-colors"
          >
            <p className="font-medium">Find cool things to do</p>
            <p className="text-muted-foreground text-sm">
              Discover events, RSVP, and get tickets
            </p>
          </button>
          <button
            onClick={() => setRole("organizer")}
            className="border-border hover:border-foreground w-full rounded-lg border p-4 text-left transition-colors"
          >
            <p className="font-medium">Create and host live events</p>
            <p className="text-muted-foreground text-sm">
              Manage events, teams, and marketing
            </p>
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 w-full space-y-4">
          <button
            type="button"
            onClick={() => setRole(null)}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            &larr; Change role
          </button>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background mt-1 h-10 w-full rounded-md border px-3"
              required
            />
          </div>
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
                {showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
              </button>
            </div>
          </div>
          <div id="clerk-captcha" />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signUpWith("oauth_google")}
            className="border-border flex h-10 w-full items-center justify-center gap-2 rounded-md border text-sm font-medium"
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => signUpWith("oauth_apple")}
            className="border-border flex h-10 w-full items-center justify-center gap-2 rounded-md border text-sm font-medium"
          >
            Continue with Apple
          </button>
        </form>
      )}

      <p className="text-muted-foreground mt-6 text-sm">
        Already have an account?{" "}
        <Link
          href={role ? `/login?role=${role}` : "/login"}
          className="text-foreground underline"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
