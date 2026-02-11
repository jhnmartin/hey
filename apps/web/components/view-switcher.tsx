"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { IconArrowsRightLeft } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DASHBOARD_KEY = "viewSwitcher:dashboard"
const PUBLIC_KEY = "viewSwitcher:public"

export function ViewSwitcher() {
  const profile = useQuery(api.profiles.get)
  const pathname = usePathname()
  const [targetHref, setTargetHref] = useState<string | null>(null)

  const isDashboard = pathname.startsWith("/dashboard")

  // Persist current path for the active view, resolve target for the other
  useEffect(() => {
    if (isDashboard) {
      sessionStorage.setItem(DASHBOARD_KEY, pathname)
      setTargetHref(sessionStorage.getItem(PUBLIC_KEY) || "/events")
    } else {
      sessionStorage.setItem(PUBLIC_KEY, pathname)
      setTargetHref(sessionStorage.getItem(DASHBOARD_KEY) || "/dashboard")
    }
  }, [pathname, isDashboard])

  if (!profile || profile.role !== "organizer") return null
  if (!targetHref) return null

  const label = isDashboard
    ? "Switch to Attendee View"
    : "Switch to Organizer View"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={targetHref}
            className="fixed right-3 bottom-4 z-50 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            <IconArrowsRightLeft className="size-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
