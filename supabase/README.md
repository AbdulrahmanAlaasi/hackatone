# supabase/

SQL migrations and seed data for Hackatone's Postgres database.

```
migrations/
  0001_enums.sql                — core enums
  0002_tables.sql               — all tables
  0003_indexes_views.sql        — indexes + dashboard views
  0004_helpers_and_triggers.sql — updated_at, new-user trigger, RLS helper fns
  0005_rls.sql                  — Row Level Security policies
  0006_storage.sql              — storage buckets + storage policies
seed.sql                        — demo org, hackathon, participants, teams,
                                  submissions, judges, scores, leaderboard, chat
```

## Applying

**Local (Supabase CLI):**

```bash
supabase db reset       # runs all migrations + seed.sql
```

**Hosted project:** open the SQL editor and paste each migration file in order
(0001 → 0006), then paste `seed.sql`.

## RLS verification checklist

After running migrations, verify in the Supabase Studio Authentication > Policies tab:

- [ ] RLS is **enabled** on all 19 user-facing tables.
- [ ] Anonymous users can `insert` into `registrations` (public registration page).
- [ ] Anonymous users cannot `select` registrations they didn't create.
- [ ] A signed-in participant can only `select` registrations where `user_id = auth.uid()`.
- [ ] Organization admins (`organization_owner`, `organizer`) can manage their org's hackathons.
- [ ] Judges can only `select` their assigned submissions and `insert/update` their own scores.
- [ ] Team members can `select` and `update` their team's submission; non-members cannot.
- [ ] `leaderboard_results` are only readable when `hackathons.leaderboard_published = true`
      (or the user is a hackathon admin).
- [ ] Participants only see chat messages for their team channel or the hackathon channel
      when `hackathons.chat_enabled = true`.

## Storage buckets

Created by `0006_storage.sql`:

| Bucket                   | Public read | Use                                  |
|--------------------------|-------------|--------------------------------------|
| `avatars`                | yes         | Profile avatars                      |
| `organization-logos`     | yes         | Org logos shown on registration page |
| `submission-screenshots` | no          | Team submission images               |
| `certificates`           | no          | Participant certificates             |

Fine-grained read control for `submission-screenshots` is enforced at the API layer
via signed URLs — see Prompt 9.

## Seed data

`seed.sql` creates demo auth users with password **`Hackatone!23`**.

| Role              | Email                       |
|-------------------|-----------------------------|
| Organization owner| `owner@hackatone.demo`      |
| Organizer         | `organizer@hackatone.demo`  |
| Judge 1           | `judge1@hackatone.demo`     |
| Judge 2           | `judge2@hackatone.demo`     |
| Participants 1-15 | `alex@hackatone.demo` … `oz@hackatone.demo` |

Demo hackathon slug: `spring-demo-2026` (registration URL:
`/register/spring-demo-2026`).
