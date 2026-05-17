-- Hackatone — Wave 2.5 schema additions.
--
-- 1. AI-generated summary on submissions (judges read it; auto-generated once).
-- 2. Helpful index for the public project gallery + activity feed.

alter table public.submissions
  add column if not exists ai_summary text,
  add column if not exists ai_summary_generated_at timestamptz;

-- Composite index for gallery & dashboard activity queries
create index if not exists idx_submissions_hackathon_status
  on public.submissions (hackathon_id, status);

create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, read_at);
