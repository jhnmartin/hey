import type { Metadata } from "next"
import { SetPageTitle } from "@/components/page-title-context"
import { ProfileForm } from "@/components/profile-form"

export const metadata: Metadata = {
  title: "Account Settings",
}

export default function AccountSettingsPage() {
  return (
    <>
      <SetPageTitle title="Account" />
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </>
  )
}
