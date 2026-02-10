"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import Link from "next/link"
import { IconSelector, IconPlus, IconSettings } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useOrg, orgRoleIcons } from "@/components/org-context"

type OrgRole = "venue" | "performer" | "promoter"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { orgs, activeOrg, setActiveOrg } = useOrg()
  const router = useRouter()
  const createOrg = useMutation(api.organizations.create)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newRole, setNewRole] = useState<OrgRole>("venue")
  const [newEmail, setNewEmail] = useState("")
  const [creating, setCreating] = useState(false)
  const pendingOrgId = useRef<string | null>(null)

  // When a new org appears in the list after creation, switch to it and navigate
  useEffect(() => {
    if (!pendingOrgId.current) return
    const newOrg = orgs.find((o) => o._id === pendingOrgId.current)
    if (newOrg) {
      pendingOrgId.current = null
      setActiveOrg(newOrg)
      router.push("/dashboard/organization")
    }
  }, [orgs, setActiveOrg, router])

  async function handleCreate() {
    if (!newName || !newEmail) return
    setCreating(true)
    const orgId = await createOrg({ name: newName, role: newRole, email: newEmail })
    pendingOrgId.current = orgId
    setDialogOpen(false)
    setCreating(false)
    setNewName("")
    setNewRole("venue")
    setNewEmail("")
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeOrg ? (
                  <>
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      {React.createElement(orgRoleIcons[activeOrg.role]!, {
                        className: "size-4",
                      })}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {activeOrg.name}
                      </span>
                      <span className="truncate text-xs capitalize">
                        {activeOrg.role}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="text-muted-foreground truncate font-medium">
                      No organization
                    </span>
                    <span className="truncate text-xs">Create one below</span>
                  </div>
                )}
                <IconSelector className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {orgs.map((org, index) => {
                const Icon = orgRoleIcons[org.role]!
                return (
                  <DropdownMenuItem
                    key={org._id}
                    onClick={() => setActiveOrg(org)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <Icon className="size-3.5 shrink-0" />
                    </div>
                    {org.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              {activeOrg && (
                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link href="/dashboard/organization">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <IconSettings className="size-4" />
                    </div>
                    <div className="text-muted-foreground font-medium">
                      Manage Organization
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="gap-2 p-2"
                onSelect={() => setDialogOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <IconPlus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to manage events, collaborate with teams, and grow your audience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-org-name">Name</Label>
              <Input
                id="new-org-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My Organization"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-org-role">Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as OrgRole)}>
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
              <Label htmlFor="new-org-email">Email</Label>
              <Input
                id="new-org-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="org@example.com"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating || !newName || !newEmail}>
              {creating ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
