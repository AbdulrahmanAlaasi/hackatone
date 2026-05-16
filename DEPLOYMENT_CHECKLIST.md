# Hackatone Deployment Checklist

Use together with [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md). This file is the **operational** checklist for shipping Hackatone.

---

## 1. Supabase (database + auth + storage)

- [ ] Create a Supabase project (free tier is fine for the demo).
- [ ] In **SQL Editor**, run migrations in order:
  - `supabase/migrations/0001_enums.sql`
  - `supabase/migrations/0002_tables.sql`
  - `supabase/migrations/0003_indexes_views.sql`
  - `supabase/migrations/0004_helpers_and_triggers.sql`
  - `supabase/migrations/0005_rls.sql`
  - `supabase/migrations/0006_storage.sql`
  - `supabase/migrations/0007_chat_channels_auto.sql`
- [ ] (Optional) Run `supabase/seed.sql` for a populated demo org.
- [ ] In **Authentication → Providers**, leave Email enabled. Disable email confirmation for the demo (Auth → Settings → "Confirm email" off) so participants can sign in immediately.
- [ ] In **Storage**, confirm buckets `avatars`, `organization-logos`, `submission-screenshots`, `certificates` exist (migration 0006 creates them).
- [ ] In **Authentication → URL Configuration**, add `https://hackatone.alaasi.dev` and `http://localhost:3000` to **Site URL** and **Redirect URLs**.
- [ ] In **Project Settings → API**, copy:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`
  - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (web only, **never** mobile)

### RLS verification (manual smoke test)

- [ ] Open the project's SQL editor signed in as anon (use `select set_config('role','anon',true)`): inserting into `registrations` works, selecting hidden rows does not.
- [ ] As a participant user, `select * from registrations` only returns their own row.
- [ ] As an organizer user, the same query returns every registration for the hackathons they manage.
- [ ] As a judge, `insert/update scores` works only for submissions they're assigned to.

---

## 2. Web app — Cloudflare Pages

The Next.js app uses the App Router with server components and middleware. Use the official **`@cloudflare/next-on-pages`** adapter.

- [ ] In Cloudflare Dashboard → Workers & Pages → **Create application → Pages → Connect to Git**, connect this repository.
- [ ] **Framework preset:** Next.js.
- [ ] **Build command:** `cd apps/web && npm install && npx @cloudflare/next-on-pages@latest`
- [ ] **Build output directory:** `apps/web/.vercel/output/static`
- [ ] **Root directory:** keep blank (monorepo handled by the build command above).
- [ ] **Node version:** `20` (set as build env var `NODE_VERSION=20`).
- [ ] Add the following **Environment variables** (production + preview):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`  *(set as a "Secret")*
  - `NEXT_PUBLIC_SITE_URL=https://hackatone.alaasi.dev`
- [ ] In **Pages → Settings → Functions → Compatibility flags**, enable `nodejs_compat`.
- [ ] In **Custom domains**, add `hackatone.alaasi.dev` and follow the CNAME instructions.
- [ ] Trigger a fresh deploy and verify:
  - `/` landing renders
  - `/register/spring-demo-2026` loads (if seed is applied)
  - `/login`, `/signup` work
  - `/dashboard` redirects to `/login` when signed out

---

## 3. Mobile app — Expo

### Expo Go (fastest path)

- [ ] In `apps/mobile/.env.local`, set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] `npm run dev:mobile` from the repo root.
- [ ] Scan the QR code with the **Expo Go** app on iOS/Android.
- [ ] Sign in with a demo seed account (e.g. `alex@hackatone.demo` / `Hackatone!23`).

### EAS internal distribution

- [ ] `npm install -g eas-cli` and `eas login`.
- [ ] In `apps/mobile`, run `eas init` (creates `eas.json`).
- [ ] `eas build --profile preview --platform android` to get an APK link.
- [ ] `eas build --profile preview --platform ios` for an internal-distribution iOS build (requires an Apple Developer account).
- [ ] Set Supabase env vars on EAS: `eas secret:create` for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### TestFlight (iOS)

- [ ] Apple Developer Program membership ($99/yr).
- [ ] Create an App Store Connect record with bundle ID `dev.alaasi.hackatone`.
- [ ] `eas build --profile production --platform ios --auto-submit`.
- [ ] Add internal testers from App Store Connect → TestFlight.

---

## 4. Domain + DNS

- [ ] `hackatone.alaasi.dev` → CNAME → `<your-pages-project>.pages.dev`.
- [ ] In Supabase **Auth → URL Configuration**, confirm the production domain is whitelisted.
- [ ] (Optional) `api.hackatone.alaasi.dev` reserved for future custom backend.

---

## 5. Post-deploy sanity check

Walk the demo flow on the live URL:

1. Organizer signs in at `https://hackatone.alaasi.dev/login`.
2. Creates an org (or uses seeded one) and a new hackathon.
3. Opens **QR & registration**, scans the QR with a phone → public form opens.
4. Submits the form → success page appears.
5. Back in dashboard → **Participants** → accepts the new entry.
6. New email signs into the mobile app → sees the accepted hackathon.
7. Opens **My QR** → organizer pastes the token under **Check-in** → marked checked in.
8. Mobile user joins/creates a team → submits a project.
9. Judge user (seeded) signs into web → **Scoring** → submits final scores.
10. Organizer → **Leaderboard** → **Recompute & publish** → mobile **Results** tab shows the rankings.

If all 10 pass, the deployment is green.
