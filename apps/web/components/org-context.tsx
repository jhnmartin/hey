"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { api } from "@repo/backend/convex/_generated/api"
import type { FunctionReturnType } from "convex/server"
import { Building2, Music, Megaphone } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type Org = NonNullable<
  FunctionReturnType<typeof api.organizations.get>
>

export type OrgRole = Org["role"]

export const orgRoleIcons: Record<OrgRole, LucideIcon> = {
  venue: Building2,
  performer: Music,
  promoter: Megaphone,
}

type OrgContextValue = {
  orgs: Org[]
  activeOrg: Org | null
  setActiveOrg: (org: Org) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({ children }: { children: ReactNode }) {
  const membershipsData = useQuery(api.memberships.listByProfile)
  const searchParams = useSearchParams()

  const orgs: Org[] = (membershipsData ?? []).map((item) => item.org)

  const [activeOrg, setActiveOrg] = useState<Org | null>(null)
  const [initialOrgApplied, setInitialOrgApplied] = useState(false)

  useEffect(() => {
    if (orgs.length === 0 || initialOrgApplied) return

    const orgParam = searchParams.get("org")
    if (orgParam) {
      const match = orgs.find((o) => o._id === orgParam)
      if (match) {
        setActiveOrg(match)
        setInitialOrgApplied(true)
        return
      }
    }

    if (!activeOrg) {
      setActiveOrg(orgs[0]!)
    }
    setInitialOrgApplied(true)
  }, [orgs, activeOrg, searchParams, initialOrgApplied])

  return (
    <OrgContext.Provider
      value={{ orgs, activeOrg, setActiveOrg }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error("useOrg must be used within OrgProvider")
  return ctx
}
