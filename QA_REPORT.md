# Hackatone QA Report — Build Self-Review

This report walks each acceptance criterion from [APP_SPEC.md §8](APP_SPEC.md) and [AI_BUILD_PROMPTS.md "Prompt 13"](AI_BUILD_PROMPTS.md) against the implementation produced in Prompts 1–11.

Legend: ✅ done · ⚠️ partial / future-scope · 🛑 known gap.

---

## Core acceptance criteria

| # | Criterion | Status | Notes |
|---|---|---|---|
| 1 | Organizer can create a hackathon | ✅ | `/dashboard/hackathons/new` with full form, auto-seeds default judging criteria. |
| 2 | Organizer can generate registration link + QR | ✅ | `/dashboard/hackathons/[id]/qr-codes`. PNG download supported. |
| 3 | Participant can register from the web page | ✅ | `/register/[hackathonSlug]` — shared zod validation, public RLS insert, friendly error states. |
| 4 | Organizer can accept/reject participant | ✅ | Inline row actions + dedicated detail page, audit events written. |
| 5 | Participant can sign into mobile with same email | ✅ | Supabase Auth + `handle_new_user` trigger back-links pending registrations by email. |
| 6 | Accepted participant sees hackathon in mobile | ✅ | Home tab queries registrations by email; status badge per row. |
| 7 | Participant shows unique QR code | ✅ | `/hackathon/[id]/qr` renders `react-native-qrcode-svg` from `registrations.qr_token`. |
| 8 | Organizer can check in via QR or manual fallback | ✅ | `/dashboard/hackathons/[id]/check-in` — paste token **and** search-and-tap manual list. |
| 9 | Team formation mode controls behaviour | ✅ | Mobile team screen shows "Create team", "Join by code", or "Wait for assignment" based on `hackathons.team_mode`. |
| 10 | Team can submit project from mobile | ✅ | `/hackathon/[id]/submission` — save draft or submit; auto-locks after `submission_deadline`. |
| 11 | Judge can score assigned projects | ✅ | `/dashboard/hackathons/[id]/scoring` — per-criterion score + comment + draft/final modes. |
| 12 | Organizer can publish leaderboard | ✅ | `/dashboard/hackathons/[id]/leaderboard` "Recompute & publish" — computes weighted totals + impact tiebreaker. |
| 13 | Participants see published results | ✅ | Mobile `/hackathon/[id]/results` + public `/leaderboard/[hackathonSlug]`. Both hide until `leaderboard_published`. |
| 14 | Team members can chat with each other | ✅ | Mobile `/hackathon/[id]/chat` with realtime via Supabase channels. Team channel auto-created by trigger (migration 0007). |

## Privacy & access control

| Check | Status | Notes |
|---|---|---|
| Public leaderboard hides participant email + phone | ✅ | Public query selects only `submissions.title` + `teams.name` + scores. |
| Public registration page does not leak existing registrations | ✅ | RLS only allows anon `insert`, no `select`. |
| Judges only see scores they wrote | ✅ | `scores_select_self_or_admin` policy. |
| Team members only see own team's submission editing | ✅ | `submissions_team_update` requires `is_team_member(team_id)`. |
| Leaderboard hidden until publish | ✅ | `leaderboard_select_published_or_admin` policy + `hackathons.leaderboard_published` flag. |
| Chat scoped per channel | ✅ | RLS enforces team-member or hackathon-admin per channel. |

## Design system

| Check | Status | Notes |
|---|---|---|
| Web uses DESIGN.md tokens | ✅ | Full token set in `apps/web/src/app/globals.css`, components in `src/components/ui` use CSS modules. |
| Mobile uses same palette | ✅ | `apps/mobile/src/theme.ts` mirrors tokens; components in `src/components/ui.tsx`. |
| Reduced motion supported | ✅ | Web: `@media (prefers-reduced-motion: reduce)` global rule. |
| Tap targets ≥ 44px | ✅ | Button base `minHeight: 44`, web `--tap-target-min`. |
| Status colour + label (not colour-only) | ✅ | All `<Badge>` usage includes the label text. |
| Focus ring visible | ✅ | Global `:focus-visible` outline in primary orange. |

## Out-of-scope / future hardening

| Item | State | Reason |
|---|---|---|
| Native camera QR scanner on web check-in | ⚠️ | Manual token paste + search-and-tap covers the demo; camera scanning planned via `BarcodeDetector` or `html5-qrcode` in a future iteration. |
| Push notifications | ⚠️ | `push_tokens` table + `notifications` rows are written; actual Expo push send is deferred (APP_SPEC §4.9 calls this post-demo). |
| Email delivery (acceptance/rejection) | ⚠️ | Supabase Auth handles signup confirm; transactional emails (registered / accepted / deadline) are stubbed — schema supports it, no provider wired. |
| Profile avatar upload | ⚠️ | `avatars` bucket + policies exist; upload UI not built (only URL fields edited via profile form). |
| Public project gallery page | ⚠️ | `public_gallery_enabled` flag respected by RLS; dedicated `/projects/[hackathonSlug]` route not yet built. |
| Mentor role | 🛑 | Enum value exists; no UI. Marked "optional future role" in APP_SPEC §2. |
| Submission screenshot direct upload from mobile | 🛑 | URL-only for now; image picker integration is future scope. |
| App Store / Play Store release | ⚠️ | EAS internal + TestFlight steps documented in DEPLOYMENT_CHECKLIST.md. |
| Cloudflare Access for dashboard | 🛑 | Documented as future feature (APP_SPEC §9). |

---

## End-to-end smoke (manual)

The flow described in [DEPLOYMENT_CHECKLIST.md §5](DEPLOYMENT_CHECKLIST.md#5-post-deploy-sanity-check) is the canonical demo loop. Run it after every deploy.
