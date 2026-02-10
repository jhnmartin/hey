"use client"

import { useEffect, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useOrg } from "@/components/org-context"
import { SetPageTitle } from "@/components/page-title-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type OrgRole = "venue" | "performer" | "promoter"

export default function OrganizationSettingsPage() {
  const { activeOrg } = useOrg()
  const updateOrg = useMutation(api.organizations.update)

  const [name, setName] = useState("")
  const [role, setRole] = useState<OrgRole>("venue")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeOrg) {
      setName(activeOrg.name)
      setRole(activeOrg.role)
      setEmail(activeOrg.email)
      setAvatarUrl(activeOrg.avatarUrl ?? "")
    }
  }, [activeOrg])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!activeOrg) return
    setSaving(true)
    await updateOrg({
      id: activeOrg._id,
      name,
      role,
      email,
      ...(avatarUrl ? { avatarUrl } : {}),
    })
    setSaving(false)
  }

  if (!activeOrg) {
    return (
      <>
        <SetPageTitle title="Organization Settings" />
        <p className="text-muted-foreground">
          No organization selected. Create one from the sidebar.
        </p>
      </>
    )
  }

  return (
    <>
      <SetPageTitle title="Organization Settings" />
      <form onSubmit={handleSave} className="bg-muted/50 max-w-lg rounded-xl p-6">
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="performer">Performer</SelectItem>
                <SelectItem value="promoter">Promoter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </>
  )
}
