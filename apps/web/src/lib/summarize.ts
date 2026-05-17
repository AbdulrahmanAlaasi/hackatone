import { getAnthropic } from './anthropic';
import { createSupabaseServiceClient } from './supabase/server';

const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are an assistant helping hackathon judges quickly grasp a project.
Write a SINGLE compact paragraph (3-5 sentences) summarizing the project. Cover:
- What it does (in plain language).
- The most interesting technical choice or innovation.
- Who it's for / what problem it solves.

Be neutral and factual. No marketing words. No emojis. No "this project" preamble — get straight to the substance.`;

/**
 * Generate (or refresh) the AI summary for a submission.
 * Stores in submissions.ai_summary so judges don't burn tokens on every page view.
 */
export async function summarizeSubmission(submissionId: string): Promise<string | null> {
  const svc = createSupabaseServiceClient();

  const { data: sub } = await svc
    .from('submissions')
    .select(
      'id, title, description, github_url, demo_url, video_url, presentation_url, hackathon_tracks(name)',
    )
    .eq('id', submissionId)
    .maybeSingle();

  if (!sub) return null;

  const track = (sub.hackathon_tracks as unknown as { name: string } | null)?.name;
  const prompt = [
    `Title: ${sub.title}`,
    track ? `Track: ${track}` : '',
    sub.description ? `Description:\n${sub.description}` : '(no description provided)',
    sub.github_url ? `GitHub: ${sub.github_url}` : '',
    sub.demo_url ? `Demo: ${sub.demo_url}` : '',
    sub.video_url ? `Video: ${sub.video_url}` : '',
    sub.presentation_url ? `Presentation: ${sub.presentation_url}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const client = getAnthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = msg.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') throw new Error('No text in response');
    const summary = text.text.trim();

    await svc
      .from('submissions')
      .update({ ai_summary: summary, ai_summary_generated_at: new Date().toISOString() })
      .eq('id', submissionId);

    return summary;
  } catch (err) {
    console.error('[summarizeSubmission]', err);
    return null;
  }
}
