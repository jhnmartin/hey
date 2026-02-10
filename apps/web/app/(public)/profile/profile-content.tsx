"use client"

import { ProfileForm } from "@/components/profile-form"

export function ProfileContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6">
        <ProfileForm />
      </div>
    </div>
  )
}
