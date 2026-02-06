"use client"

import * as React from "react"
import {
  BarChart3,
  BookOpen,
  Calendar,
  FolderOpen,
  Hash,
  KanbanSquare,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Settings2,
  Users,
} from "lucide-react"

import { NavActiveEvents } from "@/components/nav-active-events"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Jordan Smith",
    email: "jordan@heythursday.app",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Events",
      url: "/dashboard/events",
      icon: Calendar,
      isActive: true,
      items: [
        {
          title: "All Events",
          url: "/dashboard/events",
        },
        {
          title: "Create Event",
          url: "/dashboard/events/new",
        },
      ],
    },
    {
      title: "Marketing",
      url: "/dashboard/marketing/hey-comms",
      icon: Megaphone,
      items: [
        {
          title: "hey comms",
          url: "/dashboard/marketing/hey-comms",
        },
        {
          title: "get radical",
          url: "/dashboard/marketing/get-radical",
        },
        {
          title: "Strats",
          url: "/dashboard/marketing/strats",
        },
      ],
    },
    {
      title: "Channels",
      url: "/dashboard/channels/general",
      icon: Hash,
      items: [
        {
          title: "#general",
          url: "/dashboard/channels/general",
        },
        {
          title: "#random",
          url: "/dashboard/channels/random",
        },
        {
          title: "New Channel",
          url: "/dashboard/channels/new",
        },
      ],
    },
    {
      title: "Tasks",
      url: "/dashboard/tasks",
      icon: KanbanSquare,
    },
    {
      title: "Files",
      url: "/dashboard/files",
      icon: FolderOpen,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "Account",
          url: "/dashboard/settings/account",
        },
        {
          title: "Billing",
          url: "/dashboard/settings/billing",
        },
        {
          title: "Notifications",
          url: "/dashboard/settings/notifications",
        },
      ],
    },
  ],
  secondary: [
    {
      title: "Support",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      title: "Documentation",
      url: "/dashboard/docs",
      icon: BookOpen,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavActiveEvents />
        <NavSecondary items={data.secondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
