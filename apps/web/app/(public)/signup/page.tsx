import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign Up",
}

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        Join hey thursday to discover events and never miss a night out.
      </p>
      <div className="mt-8 w-full space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <div className="bg-background mt-1 h-10 rounded-md border" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="bg-background mt-1 h-10 rounded-md border" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="bg-background mt-1 h-10 rounded-md border" />
        </div>
        <div className="bg-primary text-primary-foreground flex h-10 cursor-not-allowed items-center justify-center rounded-md text-sm font-medium opacity-50">
          Sign Up
        </div>
      </div>
      <p className="text-muted-foreground mt-6 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
