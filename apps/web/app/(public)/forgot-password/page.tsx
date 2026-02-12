"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { IconEye, IconEyeOff } from "@tabler/icons-react"

type Step = "email" | "reset"

export default function ForgotPasswordPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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

  const onSendCode = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return
      setLoading(true)
      setError("")
      try {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: email,
        })
        setResendCountdown(30)
        setStep("reset")
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? "Could not send reset code")
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, signIn, email],
  )

  const onReset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }
      setLoading(true)
      setError("")
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code,
          password,
        })
        if (result.status === "complete") {
          await setActive!({ session: result.createdSessionId })
          router.push("/auth-callback")
        } else {
          setError("Password reset could not be completed. Please try again.")
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? "Password reset failed")
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, signIn, code, password, confirmPassword],
  )

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        {step === "email" && "Enter your email and we\u2019ll send you a reset code."}
        {step === "reset" && "Enter the code and choose a new password."}
      </p>

      {step === "email" && (
        <form onSubmit={onSendCode} className="mt-8 w-full space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={onReset} className="mt-8 w-full space-y-4">
          <p className="text-sm">
            We sent a code to <strong>{email}</strong>
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}

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
                      await signIn!.create({
                        strategy: "reset_password_email_code",
                        identifier: email,
                      })
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
          <div>
            <label className="text-sm font-medium">New Password</label>
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
          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative mt-1">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background h-10 w-full rounded-md border px-3 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-muted-foreground hover:text-foreground absolute right-0 top-0 flex h-10 w-10 items-center justify-center"
                tabIndex={-1}
              >
                {showConfirm ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <p className="text-muted-foreground mt-6 text-sm">
        Remember your password?{" "}
        <Link href="/login" className="text-foreground underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
