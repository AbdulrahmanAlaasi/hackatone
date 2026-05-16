export const APP_NAME = 'Hackatone';
export const PUBLIC_WEB_URL = 'https://hackatone.alaasi.dev';

export const DEFAULT_JUDGING_CRITERIA = [
  { name: 'Innovation', min_score: 1, max_score: 5, weight: 1 },
  { name: 'Technical implementation', min_score: 1, max_score: 5, weight: 1 },
  { name: 'Design / user experience', min_score: 1, max_score: 5, weight: 1 },
  { name: 'Impact / usefulness', min_score: 1, max_score: 5, weight: 1 },
  { name: 'Presentation', min_score: 1, max_score: 5, weight: 1 },
] as const;

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

export const REGISTRATION_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'waitlisted',
  'cancelled',
] as const;

export const TEAM_FORMATION_MODES = [
  'organizer_assigned',
  'participant_created',
  'team_code',
  'invite_link',
] as const;
