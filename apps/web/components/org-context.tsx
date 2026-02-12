"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { api } from "@repo/backend/convex/_generated/api"
import type { FunctionReturnType } from "convex/server"
import { IconBuilding, IconMusic, IconSpeakerphone } from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"

export type Org = NonNullable<
  FunctionReturnType<typeof api.organizations.get>
>

export type OrgRole = Org["role"]

export const orgRoleIcons: Record<OrgRole, Icon> = {
  venue: IconBuilding,
  performer: IconMusic,
  promoter: IconSpeakerphone,
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

  // Keep activeOrg in sync with fresh query data
  useEffect(() => {
    if (!activeOrg || orgs.length === 0) return
    const fresh = orgs.find((o) => o._id === activeOrg._id)
    if (fresh && fresh !== activeOrg) {
      setActiveOrg(fresh)
    }
  }, [orgs, activeOrg])

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
