"use client"

import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
import { ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ViewSwitcher() {
  const profile = useQuery(api.profiles.get)
  const pathname = usePathname()

  if (!profile || profile.role !== "organizer") return null

  const isDashboard = pathname.startsWith("/dashboard")
  const label = isDashboard
    ? "Switch to Attendee View"
    : "Switch to Organizer View"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={isDashboard ? "/events" : "/dashboard"}
            className="fixed right-3 bottom-3 z-50 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            <ArrowRightLeft className="size-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
