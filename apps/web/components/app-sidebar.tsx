"use client"

import * as React from "react"
import {
  IconChartBar,
  IconBook,
  IconCalendar,
  IconFolderOpen,
  IconHash,
  IconLayoutKanban,
  IconLayoutDashboard,
  IconLifebuoy,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons-react"

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
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Events",
      url: "/dashboard/events",
      icon: IconCalendar,
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
      url: "/dashboard/marketing",
      icon: IconSpeakerphone,
      items: [
        {
          title: "Overview",
          url: "/dashboard/marketing",
        },
        {
          title: "Social Media",
          url: "/dashboard/marketing/organic",
        },
        {
          title: "Paid Ads",
          url: "/dashboard/marketing/get-radical",
        },
        {
          title: "Strategy",
          url: "/dashboard/marketing/strategy",
        },
      ],
    },
    {
      title: "Channels",
      url: "/dashboard/channels/general",
      icon: IconHash,
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
      icon: IconLayoutKanban,
    },
    {
      title: "Files",
      url: "/dashboard/files",
      icon: IconFolderOpen,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: IconUsers,
    },
  ],
  secondary: [
    {
      title: "Support",
      url: "/dashboard/support",
      icon: IconLifebuoy,
    },
    {
      title: "Documentation",
      url: "/dashboard/docs",
      icon: IconBook,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavActiveEvents />
        <NavSecondary items={data.secondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
