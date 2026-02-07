import type { Metadata } from "next"
import { ProfileForm } from "@/components/profile-form"

export const metadata: Metadata = {
  title: "Account Settings",
}

export default function AccountSettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Account</h1>
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </>
  )
}
