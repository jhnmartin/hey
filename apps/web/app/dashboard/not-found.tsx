"use client"

import { useRouter } from "next/navigation"

export default function DashboardNotFound() {
  const router = useRouter()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="text-primary underline underline-offset-4"
        >
          Go back
        </button>
        <a href="/dashboard" className="text-primary underline underline-offset-4">
          Dashboard
        </a>
      </div>
    </div>
  )
}
