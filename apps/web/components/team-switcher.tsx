"use client"

import * as React from "react"
import Link from "next/link"
import { IconSelector, IconPlus, IconSettings } from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useOrg, orgRoleIcons } from "@/components/org-context"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { orgs, activeOrg, setActiveOrg } = useOrg()

  return (
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
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link href="/dashboard/organization/new">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <IconPlus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add organization
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
