import Link from 'next/link';
import { Card, Icon } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface Item {
  icon: keyof typeof Icon;
  tone: 'sunrise' | 'mint' | 'sky' | 'cream';
  title: string;
  meta: string;
  href?: string;
  ts: number;
}

const ICON_BG: Record<Item['tone'], string> = {
  sunrise: 'linear-gradient(135deg, #FFB066, #F26F23)',
  mint:    'linear-gradient(135deg, #C5EFD8, #9BDDB8)',
  sky:     'linear-gradient(135deg, #CFE8FF, #A9D5FA)',
  cream:   'linear-gradient(135deg, #FFF1DE, #FFE2BD)',
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export async function ActivityFeed() {
  const supabase = await createSupabaseServerClient();

  const [{ data: regs }, { data: subs }, { data: anns }] = await Promise.all([
    supabase
      .from('registrations')
      .select('id, full_name, hackathon_id, created_at, hackathons(title)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('submissions')
      .select('id, title, hackathon_id, submitted_at, teams(name)')
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(6),
    supabase
      .from('announcements')
      .select('id, title, hackathon_id, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const items: Item[] = [];
  for (const r of regs ?? []) {
    items.push({
      icon: 'User',
      tone: 'sky',
      title: `${r.full_name} registered`,
      meta: (r.hackathons as any)?.title ?? '',
      href: `/dashboard/hackathons/${r.hackathon_id}/participants`,
      ts: new Date(r.created_at).getTime(),
    });
  }
  for (const s of subs ?? []) {
    items.push({
      icon: 'Rocket',
      tone: 'mint',
      title: `${(s.teams as any)?.name ?? 'A team'} submitted “${s.title}”`,
      meta: '',
      href: `/dashboard/hackathons/${s.hackathon_id}/submissions/${s.id}`,
      ts: new Date(s.submitted_at as string).getTime(),
    });
  }
  for (const a of anns ?? []) {
    items.push({
      icon: 'MessageCircle',
      tone: 'cream',
      title: `Announcement: ${a.title}`,
      meta: '',
      href: `/dashboard/hackathons/${a.hackathon_id}/announcements`,
      ts: new Date(a.created_at).getTime(),
    });
  }

  items.sort((a, b) => b.ts - a.ts);
  const top = items.slice(0, 10);

  if (top.length === 0) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Activity will show up here as participants register, submit, or organizers post
          announcements.
        </p>
      </Card>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-2)' }}>
      {top.map((it, i) => {
        const IconCmp = Icon[it.icon];
        const body = (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: ICON_BG[it.tone],
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <IconCmp size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{it.title}</p>
              {it.meta ? (
                <p style={{ margin: 0, fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}>
                  {it.meta}
                </p>
              ) : null}
            </div>
            <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
              {timeAgo(it.ts)}
            </span>
          </div>
        );
        return (
          <li key={i}>
            {it.href ? (
              <Link href={it.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
