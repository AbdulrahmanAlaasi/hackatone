# CLAUDE.md — Hackatone Project Context

> Drop this in a fresh Claude conversation to continue work. It captures the full state of the project: what's built, what's broken, what conventions to follow, and what comes next.

---

## 1. What this project is

**Hackatone** is a hackathon management platform with three audiences:

| Role | Where they work | What they do |
|---|---|---|
| **Organizers** | Web dashboard | Create hackathons, manage participants/teams, send announcements, publish results |
| **Judges** | Web `/judge` area | Score submissions assigned to them |
| **Participants** | Mobile app only | Show QR check-in, manage team, submit project, chat |

Participants **cannot** use the web — if they sign in there, they hit `/welcome` telling them to use the mobile app.

---

## 2. Live URLs

- **Production web:** https://hackatone.alaasi.dev (Cloudflare Pages, edge runtime)
- **GitHub repo:** https://github.com/AbdulrahmanAlaasi/hackatone (push to `main` auto-deploys)
- **Supabase project ref:** `laiorxysytdbbzaiigwl` (URL: `https://laiorxysytdbbzaiigwl.supabase.co`)
- **Mobile:** Expo Go (no app store release yet). `apps/mobile` runs via `npx expo start --tunnel`.

---

## 3. Tech stack

- **Monorepo:** npm workspaces (`apps/web`, `apps/mobile`, `packages/shared`)
- **Web:** Next.js 15.5.2 App Router on **Cloudflare Pages Edge runtime** via `@cloudflare/next-on-pages`. React 19. CSS Modules. `runtime = 'edge'` set in root layout.
- **Mobile:** Expo SDK 54, React 19, React Native 0.81, Expo Router, react-native-reanimated 4, react-native-svg, react-native-qrcode-svg, expo-linear-gradient.
- **Database/auth/storage/realtime:** Supabase (Postgres + GoTrue + Storage + Realtime). Service role used only on server.
- **AI:** Anthropic Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk` v0.32+. PDF analysis uses `document` content blocks.
- **Shared types:** `@hackatone/shared` (zod schemas, enums, constants).

---

## 4. Repo layout

```
apps/
  web/                              Next.js 15 dashboard + public + judge + welcome
    src/app/
      page.tsx                      Landing (animated H logo, big wordmark, 2 CTAs)
      (auth)/                       login, signup, forgot-password (centered glass card)
      dashboard/                    Organizer area (sidebar nav, role-gated)
        hackathons/[id]/            Sidebar nav: Overview/Participants/Check-in/
                                    AI team balancer/Judges/Submissions/Scoring/
                                    Leaderboard/Announcements/Chat/Tracks/Criteria/
                                    QR & registration
      judge/                        Judge-only area (separate top-bar layout)
      register/[hackathonSlug]/     Public registration form (new vs existing toggle)
      welcome/                      Participant-on-web landing ("use the mobile app")
      projects/[hackathonSlug]/     Public project gallery (when gallery enabled)
      leaderboard/[hackathonSlug]/  Public leaderboard (when published)
      api/                          ⭐ Edge API routes (see §10)
        register/route.ts
        register-existing/route.ts
        start-analysis/route.ts
    src/components/ui/              Card, Button, Hero, Eyebrow, Display, Badge,
                                    Field, Icon (SVG set), Skeleton, Toast, etc.
    src/lib/
      supabase/{client,server,middleware}.ts
      anthropic.ts                  Claude SDK singleton
      cv.ts                         analyzeCv() — parses PDF via Claude
      summarize.ts                  summarizeSubmission() — judge-facing summary
      auth.ts                       getCurrentUserOrRedirect, getMyOrganization

apps/mobile/                        Expo participant app
  app/
    _layout.tsx                     5s breathing splash, then auth-gated routing
    (auth)/sign-in.tsx, sign-up.tsx Sunrise hero + form
    (tabs)/index.tsx, qr.tsx, profile.tsx
    hackathon/[id]/                 index, qr, team, submission, chat, results
  src/
    components/ui.tsx, Icon.tsx, Splash.tsx
    auth/AuthProvider.tsx
    theme.ts                        Design tokens (mirrors web)
    lib/supabase.ts

packages/shared/src/                Types, constants, zod validators

supabase/migrations/                0001 → 0012 (apply in order)
supabase/seed.sql                   Demo org/users/hackathon/teams/scores
```

---

## 5. Design system (DESIGN.md is canonical)

Warm Headspace-inspired vibe — **but never copy Headspace assets or characters.**

- **Primary orange:** `#FF8A3D` (pressed `#E96F26`, light `#FFB066`)
- **Cream:** `#FFF8EF` (background), `#FFE8D6` (soft surface)
- **Yellow accent:** `#FFD166`
- **Charcoal text:** `#2B2B2B`, muted `#77716A`
- **Radii:** cards `24px`, pills `999px`, tiles `28px`
- **Logo:** see `hackatone_svg_logo/` (icon, wordmark, horizontal, stacked, app icon). Copies live in `apps/web/public/`.
- **Splash (mobile):** white background, orange blob rises from bottom with breathing height + arc curve, big "Hackatone" + tagline. 5-second minimum hold via `MIN_SPLASH_MS` in `apps/mobile/app/_layout.tsx`.
- **All icons:** inline SVG via `Icon.Rocket`, `Icon.Sparkles`, etc. (no emojis anywhere user-facing).

---

## 6. Database schema (key tables)

Run `0001` through `0012` from `supabase/migrations/` IN ORDER. RLS is enabled on every user-facing table.

| Table | Notes |
|---|---|
| `profiles` | Mirrors auth.users; auto-created by trigger. Holds CV + AI fields: `cv_url`, `ai_skills[]`, `ai_level`, `ai_strengths[]`, `ai_summary`, `ai_analyzed_at` |
| `organizations` | `owner_id` + `logo_url` |
| `organization_members` | role enum: `platform_admin`/`organization_owner`/`organizer`/`judge`/`participant`/`mentor` |
| `hackathons` | Includes `visibility` (`public`/`private`), `field` (text), `leaderboard_published`, `public_gallery_enabled`, `chat_enabled` |
| `hackathon_tracks` | Categories |
| `registrations` | `qr_token` random by default. Linked to `user_id` via trigger 0008 |
| `teams` + `team_members` | Auto-create chat channel via trigger 0007 |
| `submissions` | One per team. Has `ai_summary` + `ai_summary_generated_at` (cached judge view) |
| `judging_criteria`, `judge_assignments`, `scores` | |
| `leaderboard_results` | Computed by `recomputeAndPublish` server action |
| `announcements` | `hidden` boolean for soft-hide |
| `chat_channels`, `chat_messages` | Realtime publication enabled in 0012 |
| `notifications` | Realtime publication enabled. Inserted via service role on announcement |
| `push_tokens`, `audit_events` | |

**Critical triggers:**
- `handle_new_user` (0004) — creates profile on auth signup; backfills pending registrations by email
- `link_registration_to_user` (0008) — fills `registrations.user_id` when registering with an existing email
- `create_team_chat_channel` (0007) — creates a team's chat channel automatically on team insert
- `set_updated_at_*` — every updatable table

**Realtime publication (0012)** includes `chat_messages` + `notifications`.

---

## 7. Critical operational rules — READ THIS

### How migrations get applied
Supabase doesn't expose arbitrary SQL via the public REST API. To apply a migration, the user provided a **Supabase Personal Access Token** (rotated, ask for fresh if needed). Use the **Management API**:

```js
await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${SUPABASE_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sqlText }),
});
// Always follow with:
//   { query: "notify pgrst, 'reload schema';" }
```

**Several migrations were silently missed earlier** (0008, 0009 were missed initially). Always verify by querying the column/trigger directly after applying.

### How Cloudflare deploys work
- Push to `main` triggers auto-deploy.
- Manage env vars + trigger deploys via the Cloudflare API token (Pages scope) the user provided. Endpoint: `/accounts/${CF_ACCT}/pages/projects/hackatone`.
- **Always wait** for deploy `latest_stage` to be `success` before declaring it live (~3-5 min per deploy).
- Production env vars currently set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `ANTHROPIC_API_KEY`, `NODE_VERSION=20`.

### Edge runtime gotchas (LEARNED THE HARD WAY)
- **`Buffer` doesn't exist.** Use `atob`/`btoa` + `Uint8Array` (`base64ToUint8Array` helper).
- **`require()` fails.** Use static `import` only.
- **Server actions are flaky for large payloads.** "Unexpected response from server" usually means the worker crashed mid-response. **Move to API routes** (`app/api/*/route.ts` with `export const runtime = 'edge'`) for any non-trivial action — they return clean JSON.
- **`auth.admin.createUser` via supabase-js can hang.** Use direct REST: `POST ${url}/auth/v1/admin/users` with service-role key in `apikey` + `Authorization` headers.
- **`ctx.waitUntil` pattern** for background work: dynamic-import `@cloudflare/next-on-pages`, call `getRequestContext().ctx.waitUntil(promise)`. Falls back to fire-and-forget on other runtimes.
- **Tracks/criteria editors** — direct browser-client inserts work more reliably than server actions for simple CRUD (RLS still enforces permissions).

### Local development never reproduces these — only Cloudflare does
Always test on `hackatone.alaasi.dev` after deploy.

---

## 8. Live features (✅ working)

### Web
- Animated showcase landing with big "Hackatone" wordmark, 3D-feeling cream-tile logo (breathing + Y-axis rotation), 2 CTAs (Create org / Sign in), mobile-app promo strip, feature chips
- Auth pages (login/signup/forgot-password) — centered glass card with soft warm-ambient orbs
- Organizer dashboard with sidebar nav including **Hackathons dropdown** (expandable list of all org hackathons)
- Hackathon detail layout with second-level sidebar nav grouped by Overview / People / Projects & judging / Configure
- Hackathon CRUD (create/edit) with **visibility** (public/private) + **field/category** dropdown + custom
- Tracks editor (browser-client direct insert)
- Judging criteria editor
- Participants table with accept/reject inline actions, search, filters
- Check-in via QR token paste OR manual search-and-tap
- Submissions list + detail (with **AI Claude-generated summary, cached**)
- Judge assignment by email
- Scoring page (organizer view + dedicated judge view at `/judge`)
- Leaderboard with **recompute & publish** server action (snake-draft tie-breaker by impact)
- AI Team Balancer (`/dashboard/hackathons/[id]/teams-ai`) — snake-drafts accepted participants by `ai_level`, "Apply" creates teams
- Announcements: create + hide/unhide + delete, with notification fan-out to accepted participants
- Realtime chat (`/dashboard/hackathons/[id]/chat`) — channel rail with color-coded dots, message bubbles, Supabase realtime subscribe
- Notification bell — floats at top-right of main content area, popover with unread items, polls every 30s
- QR code generator + copy registration URL
- Organization logo upload (URL field — file upload not yet built)
- Public **project gallery** at `/projects/[slug]` (when `public_gallery_enabled`)
- Public **leaderboard** at `/leaderboard/[slug]` (when `leaderboard_published`)
- **Activity feed** on dashboard overview (registrations + submissions + announcements merged)
- **Role-gated routing:** organizers → `/dashboard`, judges → `/judge`, participants → `/welcome` (mobile app instructions)
- **Toast** + **Skeleton** + animated **EmptyState** primitives ready for use

### Mobile
- Breathing-blob splash screen (5s minimum hold), then auth-aware routing
- Auth screens with sunrise hero
- Home tab — personalized greeting hero, "Up next" card, hackathon list with status badges
- Hackathon detail with bento action tile grid (My QR / Team / Submission / Chat / Results / Directions)
- "Open in Maps" button using Apple Maps / Google Maps deep link
- Org logo shown on hackathon detail
- QR tab with picker + per-hackathon QR detail screen (real QR via react-native-qrcode-svg)
- Team screen: shows existing team or join/create UI based on `team_mode`
- Submission form with auto-lock after deadline
- Realtime chat (team + general)
- Results screen
- Profile editing

### AI features
- **CV analysis** at registration: Claude Haiku extracts `ai_level` + `ai_skills[]` + `ai_strengths[]` + `ai_summary`. Runs in background after registration, results polled on the success page.
- **Submission summary** for judges: cached in `submissions.ai_summary`, auto-generated on first view of submission detail, "Regenerate" button available.
- **Team balancer:** snake-draft based on AI-extracted levels.

---

## 9. Registration flow (the critical end-to-end path)

Public form at `/register/[hackathonSlug]` with two tabs:

1. **"I'm new here"** — full form: name, email, **password**, **CV (PDF required, max 5 MB)**, profile fields.
   - Flow:
     1. `POST /api/register` with small JSON payload (no CV) → creates auth user via direct GoTrue REST, inserts registration row, updates profile metadata. Returns `{ok: true, userId}`.
     2. Browser `supabase.auth.signInWithPassword(...)` (silent).
     3. Browser uploads CV directly to `cvs/<userId>/cv.pdf` via Supabase storage client (RLS allows authenticated user → own folder).
     4. Browser generates signed URL, writes to `profiles.cv_url`.
     5. Browser `POST /api/start-analysis` (fire and forget) → server kicks off `analyzeCv()` in `ctx.waitUntil`.
   - Total response time: **3-5 seconds**.

2. **"I already have an account"** — only name + email + optional profile fields.
   - `POST /api/register-existing` looks up user by `profiles.email`, inserts registration. Returns error if no account exists.

Success page polls `getAnalysisStatus(email)` every 5s and shows the AI summary card when Claude finishes.

---

## 10. API routes (Edge)

All under `apps/web/src/app/api/*/route.ts`. Use these instead of server actions for any non-trivial work.

| Route | Purpose |
|---|---|
| `POST /api/register` | New-user registration |
| `POST /api/register-existing` | Existing-user registration |
| `POST /api/start-analysis` | Kick off Claude CV analysis (background) |

When adding new endpoints, follow the same pattern: `runtime = 'edge'`, return `NextResponse.json({ ok, ... })`, wrap in `try/catch`, surface errors as `{ok: false, error: '...'}` with appropriate HTTP status.

---

## 11. Known issues / TODO

### High priority
- [ ] **Verify end-to-end registration works on prod** after the latest API-route refactor (commit `312e842`). Test with a real PDF.
- [ ] **Push notifications** — `push_tokens` schema exists, no Expo Push send wired. Most-requested missing feature.
- [ ] **Mobile: browse public hackathons** screen (filter by field, register-from-app). Currently mobile only shows hackathons you're already registered for.

### Medium
- [ ] **Org logo file upload** — currently URL paste only. Need a file-picker that uploads to `organization-logos` bucket.
- [ ] **3D animated logo render** — see end of an earlier conversation for the Claude Design prompt. Swap inline SVG on landing for a `<video>` once available.
- [ ] **CSV exports** — participants, submissions, scores.
- [ ] **Mentor role** — schema enum has it but no UI.
- [ ] **Email delivery** for accept/reject/deadlines (transactional provider integration).
- [ ] **Submission screenshot upload from mobile** — currently URL-only.
- [ ] **App Store / Play Store release path** documented in `DEPLOYMENT_CHECKLIST.md` but not executed.

### Polish
- [ ] **Page transitions** could use Next.js View Transitions API for smoother nav.
- [ ] **Mobile chat:** scope filtering on team chat (currently shows team channel + General).
- [ ] **Dark mode toggle** would add nice polish.

### Tech debt
- [ ] Server actions (`actions.ts` files) still exist alongside API routes — could fully migrate to routes for consistency.
- [ ] Some `as any` casts in pages where Supabase generated types don't include newly-migrated columns. Run `supabase gen types typescript` to fix properly.
- [ ] `prettier` not enforced on commit.

---

## 12. Demo credentials (after running `seed.sql`)

All passwords: `Hackatone!23`

| Role | Email | Goes to |
|---|---|---|
| Organization owner | `owner@hackatone.demo` | `/dashboard` |
| Organizer | `organizer@hackatone.demo` | `/dashboard` |
| Judge | `judge1@hackatone.demo`, `judge2@hackatone.demo` | `/judge` |
| Participants | `alex@…`, `bea@…`, `cody@…`, … `oz@hackatone.demo` (15 total) | `/welcome` |

Demo hackathon slug: **`spring-demo-2026`** under "Hackatone Demo Org". 5 teams, 5 submissions, full score matrix, published leaderboard.

---

## 13. Working with the user

- **Be autonomous.** They explicitly said don't ask for permission to continue when the next step is obvious. Show progress + report results.
- **Verify by querying.** They asked us to verify deployments ourselves. Use the Cloudflare + Supabase API tokens (stored in the user's possession — ask for them if not in the conversation).
- **Always rotate disclosure.** If any token/key appears in chat, remind them to rotate it at the end.
- **They prefer the warm Headspace aesthetic.** Reference DESIGN.md tokens. Avoid emojis (use SVG icons). Use animations sparingly but intentionally.
- **They like seeing the work happen.** Run builds + deploys + verification probes inline, don't just say "this would work."
- **Hard refresh after every web deploy** to avoid stale React/Next.js client bundles (RSC server-action IDs change between builds → "Server Action … not found" errors).

---

## 14. Useful one-off scripts

### Apply a migration via the Management API
```js
// .tmp-migrate.mjs
import { readFileSync } from 'fs';
const TOKEN = process.env.SUPABASE_TOKEN;
const REF = 'laiorxysytdbbzaiigwl';
const sql = readFileSync('supabase/migrations/XXXX.sql', 'utf8');
const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
});
console.log(r.status, await r.text());
// follow with notify pgrst, 'reload schema';
```

### Trigger a Cloudflare Pages deploy + watch
```js
// .tmp-deploy.mjs
const CF_TOKEN = process.env.CF_TOKEN;
const CF_ACCT = process.env.CF_ACCT;
const trig = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCT}/pages/projects/hackatone/deployments`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
  body: '{}',
}).then(r => r.json());
const id = trig.result.id;
const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCT}/pages/projects/hackatone/deployments/${id}`;
for (let i = 0; i < 80; i++) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${CF_TOKEN}` } }).then(x => x.json());
  console.log(r.result?.latest_stage);
  if (['success','failure'].includes(r.result?.latest_stage?.status)) process.exit();
  await new Promise(r => setTimeout(r, 5000));
}
```

### Set a Cloudflare Pages env var (e.g. ANTHROPIC_API_KEY)
```js
await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCT}/pages/projects/hackatone`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deployment_configs: {
      production: { env_vars: { ANTHROPIC_API_KEY: { type: 'secret_text', value: '...' } } },
      preview:    { env_vars: { ANTHROPIC_API_KEY: { type: 'secret_text', value: '...' } } },
    },
  }),
});
```

**Remember to delete `.tmp-*` files after using them** — they contain secrets.

---

## 15. Last 5 commits at handoff

```
312e842 fix(register): existing-user path also uses API route — no more stale server-action errors
3da82c1 fix(register): switch to /api/register route — bypasses Cloudflare server-action quirks
81854b7 fix(register): keep server action small; browser uploads CV directly to Supabase storage
274d3a7 fix(register): bypass admin SDK with direct REST; move CV upload+AI fully to background
652e34c fix(chat): apply 0009 dedupe; clean channel rail (drop scope badge, color-coded dots, # prefix)
```

The chat (real-time), tracks editor, AI summarizer, role-gated routing, and judge interface are all working. The current focus is **proving end-to-end registration works** after the API-route refactor; once verified, the next priority is **mobile push notifications**.

---

End of handoff. Good luck. 🍀
