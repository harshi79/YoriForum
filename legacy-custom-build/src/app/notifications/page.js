'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { timeAgo } from '@/lib/time';

function notifText(n) {
  if (n.type === 'mention') return 'mentioned you';
  if (n.type === 'like') return 'liked your post';
  return 'replied to your thread';
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [me, setMe] = useState(null);
  const [checked, setChecked] = useState(false);

  const load = () => {
    fetch('/api/notifications?limit=50')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setItems(d.items || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user || null);
        setChecked(true);
        if (d.user) load();
      })
      .catch(() => setChecked(true));
  }, []);

  const markAll = async () => {
    await fetch('/api/notifications/read', { method: 'POST', body: '{}' });
    setItems((xs) => xs.map((x) => ({ ...x, is_read: 1 })));
  };

  if (!checked) return <div className="loading">Loading…</div>;
  if (!me)
    return (
      <div className="center-wrap">
        <div className="login-card">
          <h1>🔔 Notifications</h1>
          <p className="muted">Sign in to see who replied, mentioned or liked you.</p>
          <a href="/api/auth/github" className="btn btn-primary big-btn">
            Sign in with GitHub
          </a>
        </div>
      </div>
    );

  return (
    <>
      <div className="section-head">
        <h2>🔔 Notifications</h2>
        <span className="spacer" />
        <button className="link-btn" onClick={markAll}>
          Mark all read
        </button>
      </div>
      <div className="card">
        {items.length === 0 && <div className="empty">All caught up ✨</div>}
        {items.map((n) => (
          <Link key={n.id} href={`/t/${n.thread_id}#post-${n.post_id}`} className={`thread-row${n.is_read ? '' : ' notif-unread'}`}>
            <img src={n.actor_avatar || '/avatar.png'} alt="" className="avatar avatar-md" />
            <div className="thread-main">
              <div>
                <strong>@{n.actor}</strong> {notifText(n)} in <strong>{n.thread_title}</strong>
              </div>
              <div className="thread-meta">{timeAgo(n.created_at)}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
