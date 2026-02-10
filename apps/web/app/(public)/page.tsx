import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "hey thursday — Discover the best events near you",
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          We take the guesswork
          <br />
          out of nightlife.
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
          hey thursday connects you to the best events happening near you.
          Browse, RSVP, grab tickets, and never miss a night out again.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/events"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-6 py-3 text-sm font-medium"
          >
            Find Events
          </Link>
          <Link
            href="/signup?role=organizer"
            className="border-border hover:bg-muted inline-flex items-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
          >
            I&apos;m an Organizer
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-center text-2xl font-bold">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-muted/50 mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold">Discover</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Find events near you by location, date, or vibe. From rooftop parties to underground shows.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-muted/50 mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold">RSVP & Get Tickets</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Lock in your spot in seconds. Your tickets live in your Passport — no screenshots, no PDFs.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-muted/50 mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold">Show Up</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Walk in with your Passport. One scan gets you through the door. No lines, no hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For organizers */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Built for organizers, too.</h2>
            <p className="text-muted-foreground mt-4 text-base">
              Create events, manage your team, sell tickets, and reach your audience — all from one dashboard.
              Collaborate with venues, promoters, and artists without the back-and-forth.
            </p>
            <div className="mt-8">
              <Link
                href="/signup?role=organizer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-6 py-3 text-sm font-medium"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
