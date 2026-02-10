import type { Metadata } from "next"
import { SettingsContent } from "./settings-content"

export const metadata: Metadata = {
  title: "Preferences",
}

export default function UserSettingsPage() {
  return <SettingsContent />
}
