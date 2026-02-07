"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileForm() {
  const profile = useQuery(api.profiles.get)
  const seedProfile = useMutation(api.profiles.seed)
  const updateProfile = useMutation(api.profiles.update)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void seedProfile()
  }, [seedProfile])

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setEmail(profile.email)
      setPhone(profile.phone ?? "")
      setCity(profile.city ?? "")
      setDateOfBirth(profile.dateOfBirth ?? "")
      setBio(profile.bio ?? "")
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const [result] = await Promise.all([
      updateProfile({
        id: profile._id,
        name,
        email,
        phone,
        city,
        dateOfBirth,
        bio,
      }),
      new Promise((r) => setTimeout(r, 1000)),
    ])
    setSaving(false)
  }

  if (profile === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="bg-muted/50 rounded-xl p-6">
      <h2 className="font-semibold">Profile</h2>
      <div className="mt-4 space-y-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
