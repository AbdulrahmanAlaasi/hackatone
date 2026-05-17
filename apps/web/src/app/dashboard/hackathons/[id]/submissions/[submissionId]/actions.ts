'use server';

import { revalidatePath } from 'next/cache';
import { summarizeSubmission } from '@/lib/summarize';

export async function regenerateSummary(submissionId: string) {
  const s = await summarizeSubmission(submissionId);
  revalidatePath(`/dashboard/hackathons/[id]/submissions/${submissionId}`, 'page');
  return { ok: s !== null };
}
