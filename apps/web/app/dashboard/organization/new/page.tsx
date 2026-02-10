"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
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

export default function NewOrganizationPage() {
  const router = useRouter()
  const createOrg = useMutation(api.organizations.create)

  const [name, setName] = useState("")
  const [role, setRole] = useState<OrgRole>("venue")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await createOrg({
      name,
      role,
      email,
      ...(avatarUrl ? { avatarUrl } : {}),
    })
    router.push("/dashboard")
  }

  return (
    <>
      <SetPageTitle title="Create Organization" />
      <form onSubmit={handleSubmit} className="bg-muted/50 max-w-lg rounded-xl p-6">
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
            {saving ? "Creating..." : "Create Organization"}
          </Button>
        </div>
      </form>
    </>
  )
}
