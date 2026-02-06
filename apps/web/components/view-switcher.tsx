"use client"

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
  const pathname = usePathname()
  const isCreatorView = pathname.startsWith("/dashboard")
  const label = isCreatorView
    ? "Switch to Attendee View"
    : "Switch to Creator View"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={isCreatorView ? "/events" : "/dashboard"}
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
