# Hey Thursday

Nightlife and live events platform connecting event-goers with organizers, venues, artists, and promoters.

## Overview

**For Attendees (mobile app):**
- Discover events nearby via geolocation/geofencing, or search other areas
- Bookmark, RSVP, and purchase tickets
- **Passport** — a universal scannable identity that holds tickets, tracks attendance, and acts as a loyalty card across venues and events. Venues scan attendees in, building a shared profile of engagement over time.

**For Organizers (web dashboard + pro app):**
- Create and manage events for public discovery and ticketing
- Invite collaborating organizations (venues, promoters, artists, production teams) with scoped access per event
- Built-in collaboration tools: file management (Dropbox-style), task boards (Trello-style), team messaging (Slack-style), AI chat and auto-completions
- Marketing tools: email, SMS, and push notifications powered by platform audience data, with options to boost events via Hey Thursday's internal channels

**Organizations & Collaboration:**
- Venues, promoters, artists, and their teams each have organization profiles
- Multiple orgs can collaborate on a single event with permission-based access
- Eliminates repetitive back-and-forth (hospitality riders, tech riders, day sheets, ticket splits, load-in times)
- Pro-side discovery: artists can post tour availability, venues can find and book acts

**Monetization:**
- Tiered subscriptions: Starter (free), Hobby, Pro
- Marketing services baked into subscription tiers with paid boost options

**Long-term vision:** Expand from nightlife into tour management, artist management, booking agency tools, and label services — becoming the all-in-one platform for live events.

## Workflow

Every session is one of three modes. Declare your mode at the start.

| Mode | Purpose | Rule |
|------|---------|------|
| **Feature** | Build new functionality | Make it work. Don't style it, don't optimize it. |
| **Enhancement** | UX/UI polish, design, performance | Improve what exists. Don't add new functionality. |
| **Bug Fix** | Something is broken | Fix it, nothing more. |

- Stay in scope — a feature session does not become a design session
- Each mode gets its own branch and its own PR
- If you discover work outside your current scope, note it for a future session

## Architecture

Turborepo monorepo with pnpm 9. Three apps sharing a Convex backend.

### Apps

| App | Stack | Port | Purpose |
|-----|-------|------|---------|
| `web` | Next.js 16 (App Router), Tailwind v4, shadcn/ui | 3000 | Organizer dashboard + public event pages |
| `mobile` | Expo SDK 54, Expo Router, NativeWind v4 | 8081 | Attendee app (light theme) |
| `mobile-pro` | Expo SDK 54, Expo Router, NativeWind v4 | 8082 | Organizer app (dark theme) |

### Packages

| Package | Purpose |
|---------|---------|
| `@repo/backend` | Convex serverless backend (schema, queries, mutations) |
| `@repo/ui` | Shared React UI components (button, card, code) |
| `@repo/typescript-config` | Shared tsconfig (base, nextjs, react-library) |
| `@repo/eslint-config` | Shared ESLint configs (base, next-js, react-internal) |

## Development

```bash
pnpm dev              # Start everything (all apps + Convex)
pnpm --filter web dev # Web only
pnpm --filter mobile dev       # Attendee app only
pnpm --filter mobile-pro dev   # Organizer app only
```

For Expo apps, clear Metro cache after config changes:
```bash
cd apps/mobile && npx expo start -c
cd apps/mobile-pro && npx expo start -c --port 8082
```

## Key Technical Decisions

### Web: Tailwind v4 + shadcn/ui (New York style)
- CSS imports must use relative paths for pnpm: `@import "../node_modules/tw-animate-css/dist/tw-animate.css"` (bare module imports fail with Turbopack)
- All base resets must be inside `@layer base` — unlayered CSS overrides Tailwind utility classes in v4
- tsconfig needs `"declaration": false` to avoid pnpm "cannot be named" errors

### Mobile: Expo SDK 54 + pnpm Monorepo
- **Entry point**: `"main": "./index.js"` with local file that does `import "expo-router/entry"`. Direct `"main": "expo-router/entry"` fails because Metro can't resolve pnpm symlinks.
- **Workspace root**: `EXPO_NO_METRO_WORKSPACE_ROOT=1` in `.env` — SDK 54 defaults to monorepo root which breaks Expo Router's route discovery.
- **Metro config**: Requires `watchFolders`, `nodeModulesPaths`, `unstable_enableSymlinks`, `unstable_enablePackageExports` for pnpm resolution.
- **Routing**: Must have `app/index.tsx` with `<Redirect>` or initial load shows 404.
- **`node-linker=hoisted`**: Do NOT use — causes other Metro errors.

### Mobile: NativeWind v4.2.1 + Tailwind CSS v3.4.17
- Tailwind v3 (not v4) — NativeWind v5 uses Tailwind v4 but is still pre-release.
- `react-native-css-interop` must be an explicit dependency (pnpm can't see NativeWind's transitive dep).
- Babel: `jsxImportSource: "nativewind"`, `nativewind/babel` preset, `react-native-reanimated/plugin`.
- Do NOT add `react-native-worklets/plugin` separately — Reanimated v4 includes it internally.
- Metro: wrap config with `withNativeWind(config, { input: "./global.css" })`.

## Convex Backend

Deployed at `https://bold-dodo-75.convex.cloud`. Import API from `@repo/backend/convex/_generated/api`.

Tables:
- `tasks` — demo todo items
- `profiles` — user profile (name, email, phone, bio, avatarUrl, city, dateOfBirth). Single seeded profile shared across web and mobile. Functions: `profiles.get`, `profiles.seed`, `profiles.update`.

## Route Structure

### Web (`apps/web/app/`)
- `(public)/` — Home, events, login, signup, tickets, profile, settings
- `dashboard/` — Event management, channels, files, marketing, team, analytics

### Mobile (`apps/mobile/app/`)
- `(tabs)/` — Events, My Events, Passport, Search, Profile (5-tab layout)
- Stack screens: Settings, Notifications, Messages

### Mobile-Pro (`apps/mobile-pro/app/`)
- Single screen (scaffolded, pages to be added)
