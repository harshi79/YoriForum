'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SearchBox from './SearchBox';
import { timeAgo } from '@/lib/time';

function notifText(n) {
  if (n.type === 'mention') return 'mentioned you';
  if (n.type === 'like') return 'liked your post';
  return 'replied to your thread';
}

export default function Header() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null); // 'bell' | 'menu' | null
  const wrapRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Poll for notifications — the "live" heartbeat of the forum.
  useEffect(() => {
    if (!user) return;
    let stop = false;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch('/api/notifications?limit=7');
        if (!r.ok) return;
        const d = await r.json();
        if (!stop) {
          setUnread(d.unread || 0);
          setItems(d.items || []);
        }
      } catch {}
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [user]);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const markAll = async () => {
    await fetch('/api/notifications/read', { method: 'POST', body: '{}' });
    setUnread(0);
    setItems((xs) => xs.map((x) => ({ ...x, is_read: 1 })));
  };

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="logo">
          <span className="logo-bolt">⚡</span> Yori<span className="logo-accent">Forum</span>
        </Link>

        <div className="topbar-search">
          <SearchBox />
        </div>

        <div className="topbar-right" ref={wrapRef}>
          {!loaded ? (
            <div className="skeleton-pill" />
          ) : user ? (
            <>
              <div className="dropdown-wrap">
                <button
                  className="icon-btn"
                  aria-label="Notifications"
                  onClick={() => setOpen(open === 'bell' ? null : 'bell')}
                >
                  🔔{unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
                </button>
                {open === 'bell' && (
                  <div className="dropdown">
                    <div className="dropdown-head">
                      <strong>Notifications</strong>
                      <button className="link-btn" onClick={markAll}>
                        Mark all read
                      </button>
                    </div>
                    {items.length === 0 && <div className="dropdown-empty">All caught up ✨</div>}
                    {items.map((n) => (
                      <Link
                        key={n.id}
                        href={`/t/${n.thread_id}#post-${n.post_id}`}
                        className={`notif${n.is_read ? '' : ' notif-unread'}`}
                        onClick={() => setOpen(null)}
                      >
                        <img src={n.actor_avatar || '/avatar.png'} alt="" className="avatar avatar-xs" />
                        <span>
                          <strong>{n.actor}</strong> {notifText(n)}
                          <span className="notif-thread"> — {n.thread_title}</span>
                          <span className="notif-time">{timeAgo(n.created_at)}</span>
                        </span>
                      </Link>
                    ))}
                    <Link href="/notifications" className="dropdown-foot" onClick={() => setOpen(null)}>
                      View all →
                    </Link>
                  </div>
                )}
              </div>
              <div className="dropdown-wrap">
                <button className="avatar-btn" onClick={() => setOpen(open === 'menu' ? null : 'menu')}>
                  <img src={user.avatar_url} alt={user.username} className="avatar avatar-sm" />
                </button>
                {open === 'menu' && (
                  <div className="dropdown dropdown-right">
                    <div className="dropdown-head">
                      <strong>@{user.username}</strong>
                      {user.is_admin ? <span className="pill pill-admin">admin</span> : null}
                    </div>
                    <Link href={`/u/${user.username}`} onClick={() => setOpen(null)}>
                      👤 My profile
                    </Link>
                    <Link href="/notifications" onClick={() => setOpen(null)}>
                      🔔 Notifications{unread > 0 ? ` (${unread})` : ''}
                    </Link>
                    <button className="dropdown-btn" onClick={logout}>
                      🚪 Sign out
                    </button>
                  </div>
                )}
              </div>
              <Link href="/new" className="btn btn-primary btn-sm hide-mobile">
                + New thread
              </Link>
            </>
          ) : (
            <a href="/api/auth/github" className="btn btn-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Sign in with GitHub
            </a>
          )}
        </div>
      </div>
      <div className="container topbar-search-mobile">
        <SearchBox />
      </div>
    </header>
  );
}
