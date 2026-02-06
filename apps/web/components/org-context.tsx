"use client"

import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { AudioWaveform, GalleryVerticalEnd } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type Org = {
  name: string
  logo: LucideIcon
  plan: string
}

export const orgs: Org[] = [
  {
    name: "hey thursday",
    logo: GalleryVerticalEnd,
    plan: "Pro",
  },
  {
    name: "Neon Events Co",
    logo: AudioWaveform,
    plan: "Starter",
  },
]

type OrgContextValue = {
  activeOrg: Org
  setActiveOrg: (org: Org) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({ children }: { children: ReactNode }) {
  const [activeOrg, setActiveOrg] = useState<Org>(orgs[0]!)

  return (
    <OrgContext.Provider value={{ activeOrg, setActiveOrg }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error("useOrg must be used within OrgProvider")
  return ctx
}
