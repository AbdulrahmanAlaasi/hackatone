'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './ChatPanel.module.css';

interface Channel {
  id: string;
  name: string;
  scope: 'team' | 'hackathon' | 'judge' | 'announcement';
  team_id: string | null;
}

interface Message {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  profiles?: { full_name: string | null; email?: string } | null;
}

function normalize(rows: any[] | null): Message[] {
  return (rows ?? []).map((r) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] ?? null : r.profiles ?? null,
  }));
}

function initials(name?: string | null, email?: string | null) {
  const src = name?.trim() || email?.split('@')[0] || '?';
  const parts = src.split(/[\s.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase();
}

const TONE: Record<Channel['scope'], 'success' | 'info' | 'warning' | 'neutral'> = {
  hackathon: 'success',
  team: 'info',
  judge: 'warning',
  announcement: 'neutral',
};

export function ChatPanel({
  hackathonId,
  channels,
  myUserId,
}: {
  hackathonId: string;
  channels: Channel[];
  myUserId: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  // Default to the hackathon-wide General channel if present
  const defaultId = useMemo(
    () => channels.find((c) => c.scope === 'hackathon')?.id ?? channels[0]?.id ?? null,
    [channels],
  );
  const [activeId, setActiveId] = useState<string | null>(defaultId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load + realtime
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('id, body, sender_id, created_at, profiles(full_name, email)')
        .eq('channel_id', activeId)
        .order('created_at', { ascending: true })
        .limit(200);
      if (cancelled) return;
      setMessages(normalize(data));
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    })();

    const sub = supabase
      .channel(`chat:${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeId}` },
        async (payload) => {
          const m = payload.new as Message;
          // Hydrate sender profile lazily
          const { data: prof } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', m.sender_id)
            .maybeSingle();
          setMessages((prev) => [
            ...prev,
            { ...m, profiles: prof ?? null },
          ]);
          requestAnimationFrame(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(sub);
    };
  }, [supabase, activeId]);

  const send = useCallback(async () => {
    if (!activeId || !text.trim()) return;
    setSending(true);
    const body = text.trim();
    setText('');
    const { error } = await supabase
      .from('chat_messages')
      .insert({ channel_id: activeId, hackathon_id: hackathonId, sender_id: myUserId, body });
    setSending(false);
    if (error) setText(body);
  }, [activeId, hackathonId, myUserId, supabase, text]);

  return (
    <div className={styles.shell}>
      {/* Channel rail */}
      <aside className={styles.rail}>
        <p className={styles.railHeading}>Channels</p>
        <ul className={styles.channelList}>
          {channels.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className={`${styles.channelBtn} ${activeId === c.id ? styles.channelBtnActive : ''}`}
              >
                <span className={styles.channelDot} />
                <span className={styles.channelName}>{c.scope === 'team' ? `Team: ${c.name}` : c.name}</span>
                <Badge tone={TONE[c.scope]}>{c.scope}</Badge>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Conversation */}
      <section className={styles.convo}>
        <div ref={scrollRef} className={styles.stream}>
          {messages.length === 0 ? (
            <p className={styles.empty}>No messages yet. Say hi to kick off the conversation.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === myUserId;
              return (
                <div key={m.id} className={`${styles.row} ${mine ? styles.rowMine : ''}`}>
                  {!mine ? (
                    <div className={styles.avatar}>{initials(m.profiles?.full_name, m.profiles?.email)}</div>
                  ) : null}
                  <div className={`${styles.bubble} ${mine ? styles.bubbleMine : ''}`}>
                    {!mine ? (
                      <p className={styles.sender}>{m.profiles?.full_name ?? 'Someone'}</p>
                    ) : null}
                    <p className={styles.body}>{m.body}</p>
                    <span className={styles.ts}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className={styles.composer}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className={styles.input}
            autoFocus
          />
          <button type="submit" disabled={sending || !text.trim()} className={styles.sendBtn}>
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
