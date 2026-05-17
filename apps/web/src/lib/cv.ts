import { getAnthropic, type CvAnalysis } from './anthropic';
import { createSupabaseServiceClient } from './supabase/server';

const MODEL = 'claude-haiku-4-5-20251001';

// Edge-safe base64 — avoids Node's `Buffer` so it works on Cloudflare Workers.
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize)) as unknown as number[],
    );
  }
  return btoa(bin);
}

const SYSTEM_PROMPT = `You are an AI that reads engineering and design CVs for hackathons.
Your job: extract a compact, machine-readable profile so the organizer can balance teams.

Return STRICT JSON only, no prose, no markdown fences. Schema:
{
  "level": "beginner" | "intermediate" | "advanced" | "expert",
  "skills": string[],     // 5-15 concrete skills/technologies (lowercase, e.g. "react", "python", "figma")
  "strengths": string[],  // 2-5 short phrases describing standout strengths (e.g. "rapid prototyping")
  "summary": string       // 1-2 sentence neutral summary
}

Pick "level" based on years of experience + role seniority + project scope visible in the CV.`;

/**
 * Analyze a participant's CV via Claude Haiku and write the result into their profile.
 *
 * - Downloads the CV from a signed URL.
 * - Sends the PDF as a base64 document to Claude.
 * - Parses the JSON envelope and updates profiles.ai_* fields.
 * - Returns the analysis on success, or null on failure (best-effort, never throws).
 */
export async function analyzeCv(userId: string, cvSignedUrl: string): Promise<CvAnalysis | null> {
  try {
    const res = await fetch(cvSignedUrl);
    if (!res.ok) throw new Error(`CV fetch failed: ${res.status}`);
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);

    const client = getAnthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      // PDF document blocks aren't fully typed in this SDK release; cast to any.
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: 'Extract the CV profile as strict JSON matching the schema in the system prompt. Return ONLY the JSON.',
            },
          ],
        },
      ] as any,
    });

    const text = msg.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') throw new Error('No text in response');

    // Strip any accidental markdown fence
    const jsonText = text.text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '');

    const parsed = JSON.parse(jsonText) as CvAnalysis;

    // Persist to profile
    const svc = createSupabaseServiceClient();
    await svc
      .from('profiles')
      .update({
        ai_level: parsed.level,
        ai_skills: parsed.skills,
        ai_strengths: parsed.strengths,
        ai_summary: parsed.summary,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return parsed;
  } catch (err) {
    // Best-effort: log and continue. Registration still succeeds without analysis.
    console.error('[analyzeCv] failed', err);
    return null;
  }
}
