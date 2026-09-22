'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { timeAgo, fullDate } from '@/lib/time';

export default function ProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${encodeURIComponent(username)}`)
      .then((r) => {
        if (r.status === 404) {
          setMissing(true);
          return null;
        }
        return r.json();
      })
      .then((d) => d && setData(d))
      .catch(() => setMissing(true));
  }, [username]);

  if (missing) return <div className="empty">User not found. 🤷</div>;
  if (!data) return <div className="loading">Loading profile…</div>;
  const { user, stats, threads, posts } = data;

  return (
    <>
      <div className="profile-head">
        <img src={user.avatar_url} alt={user.username} className="avatar avatar-lg" />
        <div>
          <h1>
            @{user.username} {user.is_admin ? <span className="pill pill-admin">admin</span> : null}
          </h1>
          {user.bio ? <p className="bio">{user.bio}</p> : null}
          <div className="profile-stats">
            <span title={fullDate(user.created_at)}>📅 joined {timeAgo(user.created_at)}</span>
            <span>🧵 {stats.threads} threads</span>
            <span>💬 {stats.posts} posts</span>
            <a href={`https://github.com/${user.username}`} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>Recent threads</h2>
      </div>
      <div className="card">
        {threads.length === 0 && <div className="empty">No threads yet.</div>}
        {threads.map((t) => (
          <Link key={t.id} href={`/t/${t.id}`} className="thread-row">
            <div className="thread-main">
              <div className="thread-title">{t.title}</div>
              <div className="thread-meta">
                <span>{t.category_name}</span>
                <span>· 💬 {t.post_count} posts</span>
                <span>· {timeAgo(t.last_post_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h2>Recent posts</h2>
      </div>
      <div className="card">
        {posts.length === 0 && <div className="empty">No posts yet.</div>}
        {posts.map((p) => (
          <Link key={p.id} href={`/t/${p.thread_id}#post-${p.id}`} className="thread-row">
            <div className="thread-main">
              <div className="thread-excerpt">“{p.snippet}”</div>
              <div className="thread-meta">
                <span>
                  in <strong>{p.thread_title}</strong>
                </span>
                <span>· {timeAgo(p.created_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
