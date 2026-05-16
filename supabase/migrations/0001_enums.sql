-- Hackatone — core enums
-- Run before all other migrations.

create extension if not exists "pgcrypto";

create type public.platform_role as enum (
  'platform_admin',
  'organization_owner',
  'organizer',
  'judge',
  'participant',
  'mentor'
);

create type public.hackathon_status as enum (
  'draft',
  'registration_open',
  'registration_closed',
  'active',
  'judging',
  'completed',
  'archived'
);

create type public.registration_status as enum (
  'pending',
  'accepted',
  'rejected',
  'waitlisted',
  'withdrawn'
);

create type public.team_mode as enum (
  'organizer_assigns',
  'participant_creates',
  'team_code',
  'invite_link',
  'hybrid'
);

create type public.submission_status as enum (
  'draft',
  'submitted',
  'locked',
  'withdrawn'
);

create type public.message_scope as enum (
  'team',
  'hackathon',
  'judge',
  'announcement'
);

create type public.notification_channel as enum (
  'in_app',
  'email',
  'push'
);
