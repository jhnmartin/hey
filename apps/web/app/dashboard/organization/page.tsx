"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { useOrg, orgRoleIcons } from "@/components/org-context"
import { SetPageTitle } from "@/components/page-title-context"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarUploader } from "@/components/avatar-uploader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconBrandInstagram,
  IconBrandX,
  IconBrandFacebook,
  IconBrandTiktok,
  IconUsers,
  IconArrowsExchange,
  IconMapPin,
  IconX,
} from "@tabler/icons-react"
import Link from "next/link"
import { VenueAutocomplete, type VenueResult } from "@/components/venue-autocomplete"

type OrgRole = "venue" | "performer" | "promoter"

type OrgVenue = {
  placeId: string
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  lat?: number
  lng?: number
  verificationStatus: "claimed" | "pending" | "verified"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function OrganizationSettingsPage() {
  const { activeOrg } = useOrg()
  const updateOrg = useMutation(api.organizations.update)
  const members = useQuery(
    api.memberships.listByOrg,
    activeOrg ? { orgId: activeOrg._id } : "skip",
  )

  const [name, setName] = useState("")
  const [role, setRole] = useState<OrgRole>("venue")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [avatarStorageId, setAvatarStorageId] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [instagram, setInstagram] = useState("")
  const [twitter, setTwitter] = useState("")
  const [facebook, setFacebook] = useState("")
  const [tiktok, setTiktok] = useState("")
  const [venues, setVenues] = useState<OrgVenue[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeOrg) {
      setName(activeOrg.name)
      setRole(activeOrg.role)
      setEmail(activeOrg.email)
      setPhone(activeOrg.phone ?? "")
      setWebsite(activeOrg.website ?? "")
      setAvatarStorageId((activeOrg as any).avatarStorageId ?? null)
      setDescription(activeOrg.description ?? "")
      setStreet(activeOrg.address?.street ?? "")
      setCity(activeOrg.address?.city ?? "")
      setState(activeOrg.address?.state ?? "")
      setZip(activeOrg.address?.zip ?? "")
      setInstagram(activeOrg.socialLinks?.instagram ?? "")
      setTwitter(activeOrg.socialLinks?.twitter ?? "")
      setFacebook(activeOrg.socialLinks?.facebook ?? "")
      setTiktok(activeOrg.socialLinks?.tiktok ?? "")
      setVenues((activeOrg as any).venues ?? [])
    }
  }, [activeOrg])

  async function handleSave() {
    if (!activeOrg) return
    setSaving(true)
    await updateOrg({
      id: activeOrg._id,
      name,
      role,
      email,
      ...(phone ? { phone } : {}),
      ...(website ? { website } : {}),
      ...(avatarStorageId ? { avatarStorageId: avatarStorageId as any } : {}),
      ...(description ? { description } : {}),
      socialLinks: {
        ...(instagram ? { instagram } : {}),
        ...(twitter ? { twitter } : {}),
        ...(facebook ? { facebook } : {}),
        ...(tiktok ? { tiktok } : {}),
      },
      address: {
        ...(street ? { street } : {}),
        ...(city ? { city } : {}),
        ...(state ? { state } : {}),
        ...(zip ? { zip } : {}),
      },
      ...(role === "venue" ? { venues } : {}),
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

  const RoleIcon = orgRoleIcons[activeOrg.role]

  return (
    <>
      <SetPageTitle title="Organization Settings" />

      {/* Sticky header with actions */}
      <div className="bg-background sticky top-16 z-[9] -mx-4 -mt-4 flex items-center gap-2 px-4 py-4 group-has-data-[collapsible=icon]/sidebar-wrapper:top-12">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Badge variant="secondary">
          <RoleIcon className="size-3" />
          <span className="capitalize">{activeOrg.role}</span>
        </Badge>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Avatar + header area */}
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <AvatarUploader
                storageId={avatarStorageId}
                onUpload={setAvatarStorageId}
                name={name}
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-semibold">{name}</h2>
                <p className="text-muted-foreground text-sm">{email}</p>
              </div>
            </div>
          </div>

          {/* Organization Info */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Organization Info</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="mb-2 block text-sm font-medium">
                    Role
                  </Label>
                  <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venue">Venue</SelectItem>
                      <SelectItem value="performer">Performer</SelectItem>
                      <SelectItem value="promoter">Promoter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="mb-2 block text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website" className="mb-2 block text-sm font-medium">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description" className="mb-2 block text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell people about your organization..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="font-semibold">Address</h3>
            <p className="text-muted-foreground mb-4 text-sm">We do not share your address publicly.</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="street" className="mb-2 block text-sm font-medium">
                  Street
                </Label>
                <Input
                  id="street"
                  placeholder="123 Main St"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="city" className="mb-2 block text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="mb-2 block text-sm font-medium">
                    State
                  </Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="zip" className="mb-2 block text-sm font-medium">
                    Zip
                  </Label>
                  <Input
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Social Links</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <IconBrandInstagram className="text-muted-foreground size-5 shrink-0" />
                <Input
                  placeholder="Instagram username or URL"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <IconBrandX className="text-muted-foreground size-5 shrink-0" />
                <Input
                  placeholder="X (Twitter) username or URL"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <IconBrandFacebook className="text-muted-foreground size-5 shrink-0" />
                <Input
                  placeholder="Facebook page URL"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <IconBrandTiktok className="text-muted-foreground size-5 shrink-0" />
                <Input
                  placeholder="TikTok username or URL"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Venues (venue-role only) */}
          {role === "venue" && (
            <div className="bg-muted/50 rounded-xl p-6">
              <h3 className="mb-4 font-semibold">Venues</h3>
              <VenueAutocomplete
                onSelect={(result: VenueResult) => {
                  if (venues.some((v) => v.placeId === result.placeId)) return
                  setVenues((prev) => [
                    ...prev,
                    {
                      placeId: result.placeId,
                      name: result.venueName,
                      address: result.address || undefined,
                      city: result.city || undefined,
                      state: result.state || undefined,
                      zip: result.zip || undefined,
                      verificationStatus: "claimed",
                    },
                  ])
                }}
              />
              {venues.length > 0 && (
                <div className="mt-4 space-y-3">
                  {venues.map((venue) => (
                    <div
                      key={venue.placeId}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <IconMapPin className="text-muted-foreground size-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{venue.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {[venue.address, venue.city, venue.state, venue.zip]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {venue.verificationStatus}
                      </Badge>
                      <button
                        type="button"
                        onClick={() =>
                          setVenues((prev) =>
                            prev.filter((v) => v.placeId !== venue.placeId),
                          )
                        }
                        className="text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <IconX className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Team Members */}
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Team Members</h3>
              <IconUsers className="text-muted-foreground size-4" />
            </div>
            {members && members.length > 0 ? (
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.membership._id} className="flex items-center gap-3">
                    <Avatar size="default">
                      {m.profile.avatarUrl && (
                        <AvatarImage src={m.profile.avatarUrl} alt={m.profile.name} />
                      )}
                      <AvatarFallback>
                        {getInitials(m.profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.profile.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {m.profile.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {m.membership.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No team members yet.</p>
            )}
            <Link href="/dashboard/team">
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Manage Team
              </Button>
            </Link>
          </div>

          {/* Collaborations */}
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Collaborations</h3>
              <IconArrowsExchange className="text-muted-foreground size-4" />
            </div>
            <p className="text-muted-foreground text-sm">
              Coming soon — collaborate with other organizations on events.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
              View Collaborations
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
