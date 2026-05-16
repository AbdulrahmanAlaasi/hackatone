# Hackatone Deployment Plan

This document explains how to deploy Hackatone web, mobile, database, auth, storage, and domain setup.

Requested domain:

```text
hackatone.alaasi.dev
```

Preferred platform decisions:

- Web dashboard and registration pages: Cloudflare Pages connected to GitHub.
- Mobile app: Expo React Native.
- Backend/auth/database/storage: Supabase.
- Mobile distribution for early testing: Expo Go first, then EAS internal builds/TestFlight.

---

# 1. Architecture

```text
Cloudflare DNS
  -> hackatone.alaasi.dev
  -> Cloudflare Pages
  -> Next.js web app
       - public registration pages
       - organizer dashboard
       - check-in scanner page
       - public leaderboard

Expo React Native mobile app
  -> participant app
  -> QR code screen
  -> team/project/chat screens

Supabase
  -> Auth
  -> PostgreSQL database
  -> Storage
  -> Realtime for chat
  -> Edge Functions if needed later
```

---

# 2. Repository Structure

Use one monorepo:

```text
hackatone/
  apps/
    web/
      Next.js app
    mobile/
      Expo React Native app
  packages/
    shared/
      shared TypeScript types, validators, constants
    ui/
      optional shared design tokens
  supabase/
    migrations/
    seed.sql
  docs/
    optional extra docs
  APP_SPEC.md
  DESIGN.md
  DATABASE_SCHEMA.md
  USER_FLOWS.md
  DEPLOYMENT_PLAN.md
```

---

# 3. Cloudflare Pages Deployment

Use Cloudflare Pages connected to the GitHub repository.

Recommended setup:

- Root directory: `apps/web`
- Build command: depends on chosen Next.js adapter.
- Production branch: `main`
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` only if server-only routes need it
  - `NEXT_PUBLIC_SITE_URL=https://hackatone.alaasi.dev`

Important Next.js note:

- Cloudflare Pages supports Next.js through Cloudflare's Next.js guide.
- Some Next.js features need Cloudflare-specific compatibility.
- Keep the first version simple: App Router pages, server actions/API routes only if confirmed compatible, and avoid Node-only APIs unless supported by the Cloudflare adapter.

Official references:

- Cloudflare Pages Next.js guide: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- Cloudflare Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/

---

# 4. Domain Setup

Domain:

```text
alaasi.dev
```

Subdomain:

```text
hackatone.alaasi.dev
```

High-level setup:

1. Deploy web app to Cloudflare Pages.
2. In Cloudflare Pages, add custom domain `hackatone.alaasi.dev`.
3. Cloudflare should create or guide DNS record setup.
4. Confirm SSL is active.
5. Set `NEXT_PUBLIC_SITE_URL` to `https://hackatone.alaasi.dev`.
6. Configure Supabase Auth redirect URLs:
   - `https://hackatone.alaasi.dev`
   - `https://hackatone.alaasi.dev/login`
   - `https://hackatone.alaasi.dev/registration-success`

---

# 5. Supabase Setup

Use Supabase for:

- Auth.
- PostgreSQL database.
- Storage.
- Realtime chat.

Setup steps:

1. Create Supabase project.
2. Add database migrations from `DATABASE_SCHEMA.md`.
3. Enable RLS on all user-facing tables.
4. Add RLS policies.
5. Create storage buckets:
   - `avatars`
   - `submission-screenshots`
   - `organization-logos`
   - `certificates`
6. Configure Auth:
   - Email/password.
   - Magic link optional.
   - Redirect URLs for Cloudflare Pages domain.
7. Configure Realtime for chat tables if using Supabase Realtime.

Official references:

- Supabase Auth user data: https://supabase.com/docs/guides/auth/managing-user-data
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security

---

# 6. Mobile App Testing and Distribution

## Recommended MVP Testing Path

Use Expo Go first because it is fastest:

1. Install Expo Go on iOS/Android.
2. Run the Expo development server.
3. Scan QR code to open app.
4. Test participant flows.

## iOS TestFlight Reality

TestFlight usually requires:

- Apple Developer Program account.
- App Store Connect app record.
- EAS production build or app store build.
- Upload to App Store Connect.
- TestFlight review/processing.

Because of that, TestFlight is not the fastest first step. Use Expo Go or EAS internal distribution first, then TestFlight.

Official references:

- Expo internal distribution: https://docs.expo.dev/build/internal-distribution/
- Expo distribution overview: https://docs.expo.dev/distribution/introduction/

## Recommended Mobile Milestones

Milestone 1:

- Expo Go development build.
- Local testing on phone.

Milestone 2:

- EAS internal distribution build.
- Share with testers.

Milestone 3:

- iOS TestFlight.
- Android internal testing / APK.

Milestone 4:

- App Store and Google Play release.

---

# 7. Push Notifications

Push notifications are requested, but should be added after core flows are working.

Requirements:

- Store Expo push tokens in `push_tokens`.
- Ask participant permission in mobile app.
- Send notifications for:
  - Acceptance/rejection.
  - Announcements.
  - Deadline reminders.
  - Results published.

Official reference:

- Expo push notifications setup: https://docs.expo.dev/push-notifications/push-notifications-setup/

---

# 8. Email Notifications

Email is requested for MVP.

Recommended providers:

- Resend.
- SendGrid.
- Postmark.

Email events:

- Registration received.
- Accepted/rejected.
- Announcement.
- Submission deadline reminder.
- Results published.

Implementation recommendation:

- Start with a simple email function triggered by dashboard actions.
- Do not send emails directly from the client.
- Use a secure server-side route, Cloudflare Function, or Supabase Edge Function.

---

# 9. Environment Variables

Web:

```text
NEXT_PUBLIC_SITE_URL=https://hackatone.alaasi.dev
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_PROVIDER_API_KEY=
```

Mobile:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SITE_URL=https://hackatone.alaasi.dev
```

Never expose service role keys in the mobile app or browser client.

---

# 10. Deployment Checklist

## Web

- GitHub repo created.
- `apps/web` builds locally.
- Cloudflare Pages connected.
- Env vars configured.
- Custom domain connected.
- SSL active.
- Supabase Auth redirect URLs configured.
- Registration page works from QR link.
- Dashboard login works.

## Mobile

- Expo app runs locally.
- Supabase login works.
- Participant can see accepted hackathon.
- QR code screen works.
- Submission screen works.
- Chat works.
- Expo Go test passes.
- EAS build configured later.

## Database

- Migrations applied.
- RLS enabled.
- Policies tested.
- Seed data created.
- Storage buckets created.
- Realtime enabled for chat.

---

# 11. Recommended 2-Day Demo Build

Day 1:

- Set up monorepo.
- Create Supabase project.
- Create core database tables.
- Build web registration page.
- Build dashboard hackathon creation.
- Generate registration link and QR.
- Implement participant registration.
- Implement organizer accept/reject.

Day 2:

- Build Expo app login.
- Show accepted hackathon.
- Show participant/team QR.
- Implement check-in page.
- Implement basic team assignment.
- Implement project submission.
- Implement simple judging page.
- Publish leaderboard.
- Add seed data and demo script.

What can be mocked for 2-day demo:

- Push notifications.
- Emails.
- Full chat moderation.
- App Store/TestFlight distribution.
- Advanced analytics.

