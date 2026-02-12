"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
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
import { AvatarUploader } from "@/components/avatar-uploader"

type OrgRole = "venue" | "performer" | "promoter"

export default function OnboardingCreateOrgPage() {
  const router = useRouter()
  const createOrg = useMutation(api.organizations.create)

  const [name, setName] = useState("")
  const [role, setRole] = useState<OrgRole>("venue")
  const [email, setEmail] = useState("")
  const [avatarStorageId, setAvatarStorageId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await createOrg({
      name,
      role,
      email,
      ...(avatarStorageId ? { avatarStorageId: avatarStorageId as any } : {}),
    })
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-2xl font-bold">Create Your Organization</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Every organizer needs at least one organization to get started.
        </p>
        <form onSubmit={handleSubmit} className="bg-muted/50 rounded-xl p-6">
          <div className="space-y-3">
            <div className="flex justify-center">
              <AvatarUploader
                storageId={avatarStorageId}
                onUpload={setAvatarStorageId}
                name={name}
              />
            </div>
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
              <Label htmlFor="role">Type</Label>
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
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Creating..." : "Create Organization"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
