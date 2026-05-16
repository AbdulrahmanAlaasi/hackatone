# Hackatone

Hackathon management platform: organizers run events from a web dashboard, participants register from a public web page, and use a mobile app for QR check-in, team chat, and project submission. Judges score submissions and organizers publish leaderboards.

See:

- [APP_SPEC.md](APP_SPEC.md) — product requirements
- [DESIGN.md](DESIGN.md) — visual design system
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — Supabase schema
- [USER_FLOWS.md](USER_FLOWS.md) — end-to-end flows
- [MOBILE_APP_PLAN.md](MOBILE_APP_PLAN.md) — Expo app plan
- [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md) — Cloudflare/Supabase deployment
- [AI_BUILD_PROMPTS.md](AI_BUILD_PROMPTS.md) — build milestones

## Repository layout

```
apps/
  web/          Next.js 14 (App Router) — dashboard, public registration, leaderboard
  mobile/       Expo React Native — participant app
packages/
  shared/       Shared TS types, constants, zod validators
supabase/
  migrations/   SQL migrations
  seed.sql      Demo seed data
```

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (`npm i -g expo`) — only if running the mobile app
- Supabase project (URL + anon key + service role key)

## Setup

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
```

Fill in your Supabase URL and keys.

## Run

```bash
# Web dashboard + public pages
npm run dev:web      # http://localhost:3000

# Mobile app (Expo Go)
npm run dev:mobile
```

## Shared package

`packages/shared` is consumed via the workspace alias `@hackatone/shared`. Add types/validators there to keep the web and mobile apps in sync.

## Environment variables

See `.env.example` files in each app. The web app needs both the public Supabase keys and the service role key (server-side only). The mobile app only uses the public anon key.

## Build milestones

This project is built in 13 incremental prompts — see [AI_BUILD_PROMPTS.md](AI_BUILD_PROMPTS.md). Prompt 1 (project scaffolding) is the current state.
