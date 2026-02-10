import Link from "next/link"
import { PublicNavUser } from "@/components/public-nav-user"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold">
            hey thursday
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/events"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              find events
            </Link>
            <ThemeToggle />
            <PublicNavUser />
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 text-sm">
          <p className="text-muted-foreground">
            &copy; 2025 hey thursday. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
