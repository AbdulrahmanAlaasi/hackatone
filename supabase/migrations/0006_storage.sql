-- Hackatone — storage bucket setup notes
--
-- Run these in the Supabase SQL editor, or create buckets via the dashboard.
-- Storage policies live under storage.objects.

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('organization-logos', 'organization-logos', true),
  ('submission-screenshots', 'submission-screenshots', false),
  ('certificates', 'certificates', false)
on conflict (id) do nothing;

-- Public read for public buckets
create policy "public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "public read org logos"
  on storage.objects for select
  using (bucket_id = 'organization-logos');

-- Authenticated users can upload their own avatar (folder = auth.uid())
create policy "users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Submission screenshots: authenticated upload, read by team members + hackathon admins.
-- Object naming convention: <hackathon_id>/<team_id>/<filename>
create policy "authenticated upload submission screenshot"
  on storage.objects for insert
  with check (
    bucket_id = 'submission-screenshots'
    and auth.role() = 'authenticated'
  );

create policy "team/admin read submission screenshot"
  on storage.objects for select
  using (
    bucket_id = 'submission-screenshots'
    and (
      auth.role() = 'authenticated'
      -- Fine-grained team/admin checks should be enforced at the API layer
      -- using signed URLs, since storage policies cannot easily join app tables.
    )
  );
