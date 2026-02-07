import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

type Org = {
  _id: string;
  name: string;
  role: "venue" | "performer" | "promoter";
  email: string;
  avatarUrl?: string;
  ownerId: string;
};

type OrgContextValue = {
  orgs: Org[];
  activeOrg: Org | null;
  setActiveOrg: (org: Org) => void;
};

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const orgs = useQuery(api.organizations.listByOwner);

  const [activeOrg, setActiveOrg] = useState<Org | null>(null);

  useEffect(() => {
    if (orgs && orgs.length > 0 && !activeOrg) {
      setActiveOrg(orgs[0]! as Org);
    }
  }, [orgs, activeOrg]);

  return (
    <OrgContext.Provider
      value={{ orgs: (orgs ?? []) as Org[], activeOrg, setActiveOrg }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
