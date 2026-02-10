"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { IconEye, IconEyeOff } from "@tabler/icons-react"

export default function LoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const signInWith = (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded) return
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/auth-callback",
    })
  }

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isLoaded) return
      setLoading(true)
      setError("")
      try {
        const result = await signIn.create({
          identifier: email,
          password,
        })

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId })
          router.push("/auth-callback")
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? "Sign in failed")
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, email, password],
  )

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">Log in to hey thursday</h1>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        Welcome back. Sign in to access your events and tickets.
      </p>

      <form onSubmit={onSubmit} className="mt-8 w-full space-y-4">
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

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
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-md text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Log In"}
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
          onClick={() => signInWith("oauth_google")}
          className="border-border flex h-10 w-full items-center justify-center gap-2 rounded-md border text-sm font-medium"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => signInWith("oauth_apple")}
          className="border-border flex h-10 w-full items-center justify-center gap-2 rounded-md border text-sm font-medium"
        >
          Continue with Apple
        </button>
      </form>

      <p className="text-muted-foreground mt-6 text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
