'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  return `${d}d`;
}

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, read_at, created_at')
      .order('created_at', { ascending: false })
      .limit(15);
    setItems((data ?? []) as Notification[]);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  async function markAllRead() {
    const supabase = createSupabaseBrowserClient();
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', ids);
    load();
  }

  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div ref={popRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`${unread} unread notifications`}
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: 'var(--color-surface-soft)',
          border: 'none',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          position: 'relative',
          color: 'var(--color-text)',
        }}
      >
        <Icon.Mail size={18} />
        {unread > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: 'var(--color-primary)',
              boxShadow: '0 0 0 2px var(--color-surface-soft)',
            }}
          />
        ) : null}
      </button>
      {open ? (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            width: 320,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            boxShadow: '0 16px 40px rgba(43, 43, 43, 0.12)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
            <strong>Notifications</strong>
            {unread > 0 ? (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-pressed)',
                  fontWeight: 800,
                  fontSize: 'var(--font-size-caption)',
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <p style={{ padding: 16, color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-caption)' }}>
                No notifications yet.
              </p>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    background: n.read_at ? 'transparent' : 'rgba(255, 138, 61, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <strong style={{ fontSize: 'var(--font-size-body)' }}>{n.title}</strong>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{timeAgo(n.created_at)}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {n.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
