'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ThreadRow from './components/ThreadRow';
import { timeAgo } from '@/lib/time';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [cats, setCats] = useState([]);
  const [threads, setThreads] = useState([]);
  const [noDb, setNoDb] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, c, t] = await Promise.all([
        fetch('/api/stats').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/categories').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/threads?sort=latest').then((r) => (r.ok ? r.json() : null)),
      ]);
      if (!s || !c || !t) {
        setNoDb(true);
        return;
      }
      setStats(s);
      setCats(c.categories || []);
      setThreads((t.threads || []).slice(0, 12));
    } catch {
      setNoDb(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (!document.hidden) load();
    }, 30000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return <div className="loading">Loading the forum… ⚡</div>;

  return (
    <>
      {noDb && (
        <div className="db-warning">
          ⚠️ <strong>Database not connected.</strong> Run the dev server with the Cloudflare runtime:{' '}
          <code>npm run dev</code> (uses local D1 automatically). See README for details.
        </div>
      )}

      <section className="hero">
        <div>
          <h1>
            Talk about <span className="grad">anything</span>. 💬
          </h1>
          <p>A fast, free-forever community forum. Sign in with GitHub and jump in.</p>
        </div>
        {stats && (
          <div className="hero-stats">
            <div className="stat">
              <b>{stats.threads}</b>
              <span>threads</span>
            </div>
            <div className="stat">
              <b>{stats.posts}</b>
              <span>posts</span>
            </div>
            <div className="stat">
              <b>{stats.users}</b>
              <span>members</span>
            </div>
            <div className="stat">
              <b style={{ color: 'var(--green)' }}>{stats.online}</b>
              <span>online</span>
            </div>
          </div>
        )}
      </section>

      <div className="section-head">
        <h2>Categories</h2>
      </div>
      <div className="cat-grid">
        {cats.map((c) => (
          <Link key={c.id} href={`/c/${c.slug}`} className="cat-card" style={{ '--cat': c.color }}>
            <h3>{c.name}</h3>
            <p>{c.description}</p>
            <div className="meta">
              🧵 {c.thread_count} threads · 💬 {c.post_count} posts
              {c.last_active ? ` · active ${timeAgo(c.last_active)}` : ''}
            </div>
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h2>Latest discussions</h2>
        <span className="live-dot">LIVE</span>
        <span className="spacer" />
        <Link href="/new" className="btn btn-primary btn-sm">
          + New thread
        </Link>
      </div>
      <div className="card">
        {threads.length === 0 && <div className="empty">No threads yet. Be the first! 🚀</div>}
        {threads.map((t) => (
          <ThreadRow key={t.id} t={t} />
        ))}
      </div>
    </>
  );
}
