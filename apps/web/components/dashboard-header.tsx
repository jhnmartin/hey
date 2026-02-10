"use client"

import { usePageTitle } from "@/components/page-title-context"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardHeader() {
  const { title, actions } = usePageTitle()

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2 px-4">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
