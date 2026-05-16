export type UUID = string;
export type ISODateString = string;

export type UserRole =
  | 'platform_admin'
  | 'organization_owner'
  | 'organizer'
  | 'judge'
  | 'participant'
  | 'mentor';

export type RegistrationStatus = 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'cancelled';

export type CheckInStatus = 'not_checked_in' | 'checked_in';

export type TeamFormationMode =
  | 'organizer_assigned'
  | 'participant_created'
  | 'team_code'
  | 'invite_link';

export type SubmissionStatus = 'draft' | 'submitted' | 'locked';

export type HackathonStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';

export type LeaderboardVisibility = 'hidden' | 'judges_only' | 'published';

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  created_at: ISODateString;
}

export interface Hackathon {
  id: UUID;
  organization_id: UUID;
  name: string;
  slug: string;
  description: string;
  start_date: ISODateString;
  end_date: ISODateString;
  registration_deadline: ISODateString;
  submission_deadline: ISODateString;
  location: string | null;
  max_participants: number | null;
  min_team_size: number;
  max_team_size: number;
  team_formation_mode: TeamFormationMode;
  allow_solo: boolean;
  status: HackathonStatus;
  leaderboard_visibility: LeaderboardVisibility;
  hackathon_chat_enabled: boolean;
}

export interface Profile {
  id: UUID;
  email: string;
  full_name: string;
  phone: string | null;
  university_or_company: string | null;
  major_or_job_title: string | null;
  skill_level: string | null;
  skills: string[] | null;
  github_url: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface Registration {
  id: UUID;
  hackathon_id: UUID;
  profile_id: UUID | null;
  email: string;
  full_name: string;
  status: RegistrationStatus;
  check_in_status: CheckInStatus;
  checkin_token: string | null;
  preferred_track: string | null;
  team_preference: string | null;
  created_at: ISODateString;
}

export interface Team {
  id: UUID;
  hackathon_id: UUID;
  name: string;
  team_code: string | null;
  created_by: UUID | null;
}

export interface Submission {
  id: UUID;
  hackathon_id: UUID;
  team_id: UUID;
  title: string;
  description: string;
  track: string | null;
  github_url: string | null;
  demo_url: string | null;
  presentation_url: string | null;
  video_url: string | null;
  screenshots: string[];
  status: SubmissionStatus;
  submitted_at: ISODateString | null;
}

export interface JudgingCriterion {
  id: UUID;
  hackathon_id: UUID;
  name: string;
  description: string | null;
  min_score: number;
  max_score: number;
  weight: number;
}

export interface Score {
  id: UUID;
  submission_id: UUID;
  judge_id: UUID;
  criterion_id: UUID;
  score: number;
  comment: string | null;
}
