"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
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

type InviteRole = "admin" | "member"

export default function TeamPage() {
  const { activeOrg } = useOrg()
  const members = useQuery(
    api.memberships.listByOrg,
    activeOrg ? { orgId: activeOrg._id } : "skip",
  )
  const orgInvites = useQuery(
    api.invites.listByOrg,
    activeOrg ? { orgId: activeOrg._id } : "skip",
  )
  const sendInvite = useMutation(api.invites.send)
  const revokeInvite = useMutation(api.invites.revoke)

  const [email, setEmail] = useState("")
  const [role, setRole] = useState<InviteRole>("member")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!activeOrg) return
    setError("")
    setSending(true)
    try {
      await sendInvite({ orgId: activeOrg._id, email, role })
      setEmail("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite")
    } finally {
      setSending(false)
    }
  }

  const pendingInvites = (orgInvites ?? []).filter(
    (i) => i.status === "pending",
  )

  return (
    <>
      <SetPageTitle title="Team" />
      {/* Invite form */}
      <form onSubmit={handleInvite} className="bg-muted/50 rounded-xl p-4">
        <p className="mb-3 text-sm font-medium">Invite a new member</p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div className="w-32">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as InviteRole)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={sending || !activeOrg}>
            {sending ? "Sending..." : "Send Invite"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </form>

      {/* Members list */}
      <div>
        <h2 className="mb-2 text-sm font-medium">Members</h2>
        <div className="bg-muted/50 rounded-xl">
          {members === undefined ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : members.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No members yet.
            </div>
          ) : (
            members.map((item) => (
              <div
                key={item.membership._id}
                className="flex items-center justify-between border-b p-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{item.profile.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.profile.email}
                  </p>
                </div>
                <span className="bg-muted rounded-full px-3 py-1 text-xs font-medium capitalize">
                  {item.membership.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium">Pending Invites</h2>
          <div className="bg-muted/50 rounded-xl">
            {pendingInvites.map((invite) => (
              <div
                key={invite._id}
                className="flex items-center justify-between border-b p-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-muted-foreground text-sm capitalize">
                    Invited as {invite.role}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeInvite({ inviteId: invite._id })}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
