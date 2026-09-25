# Waypoint — AI Trip Planner

A full-stack, production-structured travel planner: auth, a Postgres-backed
trip model, a real nearest-neighbor + 2-opt route optimizer, opening-hours-aware
scheduling, a live budget calculator, and a Google Places/Maps integration
layer that runs on bundled sample data until you add real API keys.

## Run it right now (zero API keys needed)

```bash
npm install
cp .env.example .env.local
# Open .env.local and set at minimum:
#   DATABASE_URL   (see "Database" below — quickest is Supabase, 2 minutes)
#   NEXTAUTH_SECRET (any random string — `openssl rand -base64 32`)
npm run db:push
npm run dev
```

Open http://localhost:3000. Sign up with email/password (Google sign-in
appears automatically once you add Google OAuth keys — see below), and the
whole planner flow works end to end on bundled sample data (Jaipur
attractions/hotels) with a real, working route optimizer.

## What's real vs. mocked, and why

Everything **except three external services** is fully implemented — not
stubbed:

- **Auth** — real signup/login/session (NextAuth + Prisma), Google OAuth
  wired and ready, just needs your client ID/secret
- **Database** — real Prisma schema, real CRUD API routes for trips
- **Route optimizer** (`src/lib/optimizer.ts`) — genuine nearest-neighbor
  construction + 2-opt improvement (TSP heuristics), Haversine distance,
  opening-hours checking, lunch insertion, day clustering
- **Budget calculator** — real math against your actual selections
- **Places/Maps** (`src/lib/places.ts`) — the *only* mocked piece. It has
  one job: return attraction/hotel data in a consistent shape. Right now
  it returns bundled sample data (`src/lib/mockData.ts`). The moment you
  set `GOOGLE_MAPS_SERVER_KEY`, the exact same functions call the real
  Google Places / Geocoding / Distance Matrix APIs instead — nothing else
  in the app changes.

This means you can develop, demo, and test the entire product today, and
"go live" later by filling in three lines of `.env.local`.

## Getting each API key

### 1. Database (needed to run at all)
Fastest path — [Supabase](https://supabase.com) (free tier):
1. New project → wait ~2 min for provisioning
2. Settings → Database → Connection string → **URI** (use "Session" pooler mode)
3. Paste into `DATABASE_URL` in `.env.local`

Alternative: [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres) work the same way.
For local-only testing without any signup, change `prisma/schema.prisma`'s
`provider` to `"sqlite"` and set `DATABASE_URL="file:./dev.db"`.

### 2. Google OAuth (for "Sign in with Google")
1. [console.cloud.google.com](https://console.cloud.google.com) → create/select a project
2. APIs & Services → OAuth consent screen → configure (External, add your email as a test user)
3. Credentials → Create Credentials → OAuth client ID → Web application
4. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   (add your production URL's equivalent later)
5. Copy Client ID / Client Secret into `.env.local`

### 3. Google Maps Platform (for live attractions, hotels, geocoding, routing)
1. Same Google Cloud project → APIs & Services → Library
2. Enable: **Places API**, **Geocoding API**, **Directions API**, **Distance Matrix API**, **Maps JavaScript API**
3. Requires billing enabled on the project (Google requires a card on file;
   there's a recurring free monthly credit that covers moderate use)
4. Credentials → Create Credentials → API key
5. Put the same key in both `GOOGLE_MAPS_SERVER_KEY` (used server-side by
   API routes, restrict by IP) and `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (if you
   later add the client-side JS map, restrict by HTTP referrer)

### 4. Email — password reset (optional, has a working fallback)
Without a key, password-reset emails are printed to your server console —
functionally testable, just not actually emailed. To send real emails:
1. [resend.com](https://resend.com) → sign up → API Keys → Create
2. Put it in `RESEND_API_KEY`

## Deploying (when you're ready — no domain required to start)
1. Push this repo to GitHub
2. [vercel.com](https://vercel.com) → New Project → import the repo
3. Add the same environment variables from `.env.local` in Vercel's project settings
4. Deploy — you'll get a free `your-project.vercel.app` URL automatically
5. Update `NEXTAUTH_URL` to that URL, and add its OAuth callback
   (`https://your-project.vercel.app/api/auth/callback/google`) in the
   Google Cloud OAuth client's authorized redirect URIs
6. Point a custom domain at it later from Vercel's Domains tab, whenever you have one

## Project structure

```
src/
  app/
    page.tsx                    landing page
    (auth)/login|signup|forgot-password
    dashboard/page.tsx           the trip planner wizard
    trip/[id]/page.tsx           saved trip view
    api/
      auth/[...nextauth]         NextAuth handler
      auth/signup, forgot-password
      trips, trips/[id]          trip CRUD
      places                     attractions/hotels (mock ↔ live)
      geocode                    address → lat/lng (mock ↔ live)
      optimize                   runs the route optimizer
  components/
    TripPlanner.tsx               multi-step wizard (client)
    ItineraryView.tsx             itinerary + map + budget (shared)
    Navbar.tsx, Logo.tsx, ThemeToggle.tsx
  lib/
    auth.ts                       NextAuth config
    prisma.ts                     Prisma client singleton
    optimizer.ts                  route optimization + budget math
    places.ts                     Google Places/Geocoding/Distance Matrix adapter
    mockData.ts                   bundled sample attractions/hotels
    email.ts                      Resend adapter with console fallback
prisma/schema.prisma              User, Trip, and NextAuth models
```

## Brand

Logo mark and "Waypoint" name are placeholders I chose (a route-trail
motif echoing the itinerary timeline UI) — swap `public/logo.svg`,
`metadata.title` in `src/app/layout.tsx`, and the `Waypoint` strings in
`Logo.tsx`/`Navbar.tsx` for your own branding whenever you like.

## Since the initial build

A full UX/accessibility audit was done and acted on. Fixed/added:
- Broken password-reset flow → `/reset-password` page + API route now work end to end
- Wizard progress used to vanish on refresh → now autosaved to `localStorage` (`src/hooks/useDraftPersistence.ts`), with a "restored your details" banner and a manual "start fresh" option
- All API calls in the wizard now have real error handling (`src/lib/fetchJson.ts`) with inline retry banners instead of hanging forever on failure
- Interest/transport/category chips were unstyled `<div onClick>` (no keyboard access, no screen reader semantics) → rebuilt as real `<button role="switch">` (`src/components/ui/Chip.tsx`)
- Added skeleton loading states, empty states, and a toast system (`src/components/ui/`)
- Added a "My Trips" page (`/trips`) — the trip CRUD API existed from day one but had no UI consuming it; now supports view/duplicate/delete
- Added a public, no-login `/example` itinerary so cold visitors can see the product before signing up
- Added budget-status color badges per day tab, and the ability to remove a single stop from a generated itinerary without rebuilding the whole thing
- Added branded 404 (`not-found.tsx`) and error boundaries (`error.tsx`, `global-error.tsx`) instead of default/blank crash screens
- Added `sitemap.ts`, `robots.ts`, Open Graph/Twitter metadata, and a favicon
- Apple/Safari-specific polish: `viewport-fit=cover` + safe-area padding for the notch/home indicator, 16px minimum input font size (prevents iOS auto-zoom on focus), 44px minimum tap targets on touch devices, `apple-web-app` meta tags, Safari toolbar theme-color, autofill-safe input styling, skip-to-content link

Still open (see the full audit for the complete list): real interactive map embed,
drag-to-reorder attractions, PDF export, design-token consolidation, and the
"Future Features" bucket generally.

## Not included (would need more infrastructure/decisions)
- PWA/offline caching, PDF export, push notifications, weather/traffic
  alerts — all reasonable follow-ups once the core is deployed and you've
  decided on a weather API and a notifications provider (e.g. web push).
