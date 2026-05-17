import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAnthropic() {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

// We always extract a strict JSON envelope from the model so the server can
// parse it safely and store it in `profiles.ai_*` columns.
export interface CvAnalysis {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills: string[];
  strengths: string[];
  summary: string;
}
