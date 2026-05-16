# Hackatone AI Build Prompts

Use these prompts with an AI coding tool. Do not ask the AI to build the entire app in one message. Work in milestones and verify each milestone before continuing.

Required context files:

- `APP_SPEC.md`
- `DESIGN.md`
- `DATABASE_SCHEMA.md`
- `USER_FLOWS.md`
- `DEPLOYMENT_PLAN.md`
- `MOBILE_APP_PLAN.md`

---

# Prompt 1: Create Project Structure

```text
You are building Hackatone using the attached docs.

Create a monorepo with:
- apps/web: Next.js app for dashboard, public registration, check-in, and leaderboard.
- apps/mobile: Expo React Native app for participants.
- packages/shared: shared TypeScript types, constants, validators.
- supabase: database migrations and seed files.

Follow APP_SPEC.md and DESIGN.md.

Do not implement every feature yet. Create the clean structure, install the recommended dependencies, set up TypeScript, linting, environment variable examples, and a root README explaining how to run the project.
```

---

# Prompt 2: Supabase Schema and Seed Data

```text
Using DATABASE_SCHEMA.md, create Supabase SQL migrations for the Hackatone database.

Include:
- enums
- tables
- indexes
- helper functions
- RLS enabled on all user-facing tables
- starter RLS policies for profiles, organizations, hackathons, registrations, teams, submissions, scores, announcements, chat
- storage bucket setup notes
- seed data for one organization, one hackathon, participants, teams, submissions, judges, and scores

Keep migrations readable and split logically if needed.
```

---

# Prompt 3: Web App Foundation

```text
Build the Next.js web app foundation for Hackatone.

Use DESIGN.md for visual styling.

Implement:
- app layout
- auth pages
- public landing page or redirect
- public registration route /register/[hackathonSlug]
- registration success page
- organizer dashboard shell
- protected route handling with Supabase Auth
- shared UI components for buttons, cards, forms, badges, top header, search bar, tables

Do not build all dashboard details yet. Focus on a polished foundation.
```

---

# Prompt 4: Hackathon Creation and Registration QR

```text
Implement organizer hackathon creation in the web dashboard.

Build:
- /dashboard/hackathons
- /dashboard/hackathons/new
- /dashboard/hackathons/[id]
- create/edit hackathon form
- judging criteria editor
- tracks/categories editor
- team settings
- generated public registration URL
- generated QR code for /register/[hackathonSlug]
- participant registration table

Use Supabase for data and follow DATABASE_SCHEMA.md.
```

---

# Prompt 5: Public Registration Flow

```text
Implement the public registration flow.

Route:
- /register/[hackathonSlug]

Requirements:
- Show hackathon details.
- Show registration form.
- Store registration as pending.
- Link registration by email.
- Show success page.
- Tell participant to download/open Hackatone mobile app and sign in with same email.

The QR code generated in the dashboard should open this registration page.
```

---

# Prompt 6: Organizer Participant Review and Check-In

```text
Implement participant review and check-in in the web dashboard.

Build:
- participants table
- pending/accepted/rejected filters
- participant detail drawer or page
- accept/reject actions
- generate participant check-in token after acceptance
- QR scanner/check-in page
- manual check-in fallback by searching name/email/team
- audit events for accept/reject/check-in

Accepted participants should be able to see the hackathon in the mobile app.
```

---

# Prompt 7: Mobile App Foundation

```text
Build the Expo React Native mobile app foundation for Hackatone.

Use MOBILE_APP_PLAN.md and DESIGN.md.

Implement:
- Expo Router navigation
- Supabase Auth
- sign in/sign up screens
- My Hackathons screen
- Hackathon Details screen
- Profile screen
- shared mobile UI components using the Hackatone design tokens

Participant should sign in with the same email used in the web registration form.
```

---

# Prompt 8: Mobile Participant QR and Team Flow

```text
Implement the participant QR and team flow in the mobile app.

Build:
- My QR Code screen
- show participant/team/hackathon info
- render QR code from registration token
- Team screen
- support organizer-assigned teams
- support participant-created teams if hackathon settings allow it
- support team code joining if enabled

Only accepted participants should access QR and team features.
```

---

# Prompt 9: Project Submission

```text
Implement mobile project submission and dashboard submission review.

Mobile:
- submission form
- title, description, track, GitHub link, demo link, presentation link, video link, screenshots
- edit until deadline
- locked state after deadline

Web dashboard:
- submissions table
- submission detail page
- filters by track/team/status

Submission updates must appear for all team members.
```

---

# Prompt 10: Judging and Leaderboard

```text
Implement judging and leaderboard.

Web:
- judge assignment
- judge scoring view
- score each criterion 1 to 5 by default
- judge comments
- scoring progress
- results review
- publish leaderboard

Rules:
- leaderboard hidden until organizer publishes
- tie breaker: total score, then impact/usefulness, then manual organizer decision

Mobile:
- published results screen for participants
```

---

# Prompt 11: Chat and Announcements

```text
Implement chat and announcements.

Chat:
- team chat for team members
- hackathon-wide chat if enabled
- realtime messages using Supabase Realtime if possible
- access scoped to same team/hackathon

Announcements:
- organizer creates announcements
- participant app displays announcements
- notification records created in database

Email and push can be stubbed if not configured yet.
```

---

# Prompt 12: Deployment Preparation

```text
Prepare Hackatone for deployment.

Web:
- Cloudflare Pages configuration
- environment variable documentation
- build command documentation
- custom domain instructions for hackatone.alaasi.dev

Supabase:
- migration instructions
- RLS verification checklist
- storage bucket checklist

Mobile:
- Expo Go instructions
- EAS internal distribution instructions
- TestFlight notes

Add a DEPLOYMENT_CHECKLIST.md if useful.
```

---

# Prompt 13: Final QA and Polish

```text
Run a full QA pass against APP_SPEC.md and USER_FLOWS.md.

Verify:
- registration QR opens web page
- registration creates pending participant
- organizer can accept participant
- participant can sign in and see accepted hackathon
- QR check-in works
- team assignment/creation works based on settings
- project submission works
- judge scoring works
- leaderboard publish works
- chat works for team members
- public data does not expose private email/phone
- mobile and web match DESIGN.md
- reduced motion and accessibility basics are supported

Fix issues found during QA.
```

