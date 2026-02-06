"use client"

import { Calendar, ChevronRight, Trash2 } from "lucide-react"
import Link from "next/link"
import { useActiveEvents } from "@/components/active-events-context"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavActiveEvents() {
  const { activeEvents, removeEvent, clearAll } = useActiveEvents()

  if (activeEvents.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Active Events
        <button onClick={clearAll} className="text-muted-foreground hover:text-foreground ml-auto text-xs font-light transition-colors">
          clear all
        </button>
      </SidebarGroupLabel>
      <SidebarMenu>
        {activeEvents.map((event) => (
          <Collapsible
            key={event.id}
            asChild
            defaultOpen
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={event.name}>
                  <Calendar className="size-4" />
                  <span className="truncate">{event.name}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <SidebarMenuAction
                showOnHover
                onClick={() => removeEvent(event.id)}
                title={`Remove ${event.name}`}
              >
                <Trash2 className="size-2" />
              </SidebarMenuAction>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/dashboard/events/${event.id}/dashboard`}>
                        <span>Event Dash</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/dashboard/events/${event.id}/analytics`}>
                        <span>Analytics</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/dashboard/events/${event.id}`}>
                        <span>Details / Edit</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/dashboard/events/${event.id}/preview`}>
                        <span>Preview</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
