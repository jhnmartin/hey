import { ActiveEventsProvider } from "@/components/active-events-context"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrgProvider } from "@/components/org-context"
import { PageTitleProvider } from "@/components/page-title-context"
import { RequireOrganizer } from "@/components/require-organizer"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireOrganizer>
      <OrgProvider>
        <ActiveEventsProvider>
        <PageTitleProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <DashboardHeader />
            <div className="flex w-full flex-1 flex-col gap-4 p-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
        </PageTitleProvider>
        </ActiveEventsProvider>
      </OrgProvider>
    </RequireOrganizer>
  )
}
