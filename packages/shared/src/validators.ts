import { z } from 'zod';
import { SKILL_LEVELS, TEAM_FORMATION_MODES } from './constants';

export const registrationFormSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(5).max(40).optional().or(z.literal('')),
  university_or_company: z.string().max(160).optional().or(z.literal('')),
  major_or_job_title: z.string().max(160).optional().or(z.literal('')),
  skill_level: z.enum(SKILL_LEVELS).optional(),
  skills: z.array(z.string()).max(20).optional(),
  preferred_track: z.string().max(80).optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  team_preference: z.string().max(500).optional().or(z.literal('')),
});

export type RegistrationFormInput = z.infer<typeof registrationFormSchema>;

export const hackathonFormSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers, and dashes only'),
  description: z.string().max(8000),
  start_date: z.string(),
  end_date: z.string(),
  registration_deadline: z.string(),
  submission_deadline: z.string(),
  location: z.string().max(200).optional().or(z.literal('')),
  max_participants: z.number().int().positive().nullable(),
  min_team_size: z.number().int().min(1),
  max_team_size: z.number().int().min(1),
  team_formation_mode: z.enum(TEAM_FORMATION_MODES),
  allow_solo: z.boolean(),
  hackathon_chat_enabled: z.boolean(),
});

export type HackathonFormInput = z.infer<typeof hackathonFormSchema>;

export const submissionFormSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(10).max(8000),
  track: z.string().max(80).optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  demo_url: z.string().url().optional().or(z.literal('')),
  presentation_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
  screenshots: z.array(z.string().url()).max(8).optional(),
});

export type SubmissionFormInput = z.infer<typeof submissionFormSchema>;
