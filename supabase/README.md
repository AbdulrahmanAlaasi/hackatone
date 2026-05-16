# supabase/

SQL migrations and seed data for Hackatone's Postgres database.

```
migrations/    Numbered SQL migrations (applied in order)
seed.sql       Demo organization, hackathon, participants, teams, judges, scores
```

Schema, RLS, and seed land in Prompt 2 — see [../DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md).

## Applying migrations

With the Supabase CLI:

```bash
supabase db reset       # local
supabase db push        # remote
```

Or paste each `migrations/*.sql` file into the Supabase SQL editor in order.
