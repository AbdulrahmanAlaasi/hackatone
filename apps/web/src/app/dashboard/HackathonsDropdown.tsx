'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './HackathonsDropdown.module.css';

interface Hackathon {
  id: string;
  title: string;
  slug: string;
  status: string;
}

const STATUS_TONE: Record<string, string> = {
  active: '#7BCFA6',
  registration_open: '#7BCFA6',
  judging: '#CFE8FF',
  completed: '#E8DED4',
  draft: '#FFB199',
};

export function HackathonsDropdown() {
  const pathname = usePathname() ?? '';
  const isOnList = pathname === '/dashboard/hackathons';
  const isOnDetail = /^\/dashboard\/hackathons\/[^/]+/.test(pathname);
  const [open, setOpen] = useState(isOnList || isOnDetail);
  const [items, setItems] = useState<Hackathon[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from('hackathons')
        .select('id, title, slug, status')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!cancelled) setItems((data ?? []) as Hackathon[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-open when on a sub-route
  useEffect(() => {
    if (isOnList || isOnDetail) setOpen(true);
  }, [isOnList, isOnDetail]);

  return (
    <div className={styles.wrap}>
      <button
        className={styles.head}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>Hackathons</span>
        <span className={`${styles.chev} ${open ? styles.chevOpen : ''}`}>
          <Icon.ChevronRight size={14} />
        </span>
      </button>

      {open ? (
        <div className={styles.body}>
          <Link href="/dashboard/hackathons" className={styles.allLink}>
            All hackathons
          </Link>
          <Link href="/dashboard/hackathons/new" className={styles.newLink}>
            <Icon.Plus size={12} /> New hackathon
          </Link>

          {items === null ? (
            <p className={styles.loading}>Loading…</p>
          ) : items.length === 0 ? (
            <p className={styles.empty}>No hackathons yet.</p>
          ) : (
            <ul className={styles.list}>
              {items.map((h) => {
                const href = `/dashboard/hackathons/${h.id}`;
                const active = pathname.startsWith(href);
                return (
                  <li key={h.id}>
                    <Link href={href} className={`${styles.item} ${active ? styles.itemActive : ''}`}>
                      <span
                        className={styles.dot}
                        style={{ background: STATUS_TONE[h.status] ?? '#E8DED4' }}
                      />
                      <span className={styles.title}>{h.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
