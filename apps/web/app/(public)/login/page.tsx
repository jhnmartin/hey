"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"

export default function LoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background mt-1 h-10 w-full rounded-md border px-3"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground flex h-10 w-full items-center justify-center rounded-md text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Log In"}
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
