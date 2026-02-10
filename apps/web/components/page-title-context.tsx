"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

const PageTitleContext = createContext<{
  title: string
  setTitle: (title: string) => void
  actions: ReactNode
  setActions: (actions: ReactNode) => void
}>({ title: "Dashboard", setTitle: () => {}, actions: null, setActions: () => {} })

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Dashboard")
  const [actions, setActions] = useState<ReactNode>(null)
  return (
    <PageTitleContext.Provider value={{ title, setTitle, actions, setActions }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export function usePageTitle() {
  return useContext(PageTitleContext)
}

export function SetPageTitle({ title }: { title: string }) {
  const { setTitle } = usePageTitle()
  useEffect(() => {
    setTitle(title)
  }, [title, setTitle])
  return null
}

export function SetHeaderActions({ children }: { children: ReactNode }) {
  const { setActions } = usePageTitle()
  useEffect(() => {
    setActions(children)
    return () => setActions(null)
  }, [children, setActions])
  return null
}
