'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PostCard from '../../components/PostCard';
import Composer from '../../components/Composer';
import { timeAgo } from '@/lib/time';

const POLL_MS = 4000;

export default function ThreadPage() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState([]);
  const [me, setMe] = useState(null);
  const [missing, setMissing] = useState(false);
  const [newIds, setNewIds] = useState(new Set());
  const lastId = useRef(0);
  const liveOn = useRef(true);

  const loadThread = useCallback(async () => {
    const r = await fetch(`/api/threads/${id}`);
    if (r.status === 404) {
      setMissing(true);
      return;
    }
    if (r.ok) setThread((await r.json()).thread);
  }, [id]);

  // Initial posts + live polling for newer ones.
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d.user || null))
      .catch(() => {});

    loadThread();

    const fetchPosts = async (after) => {
      try {
        const r = await fetch(`/api/threads/${id}/posts?after=${after}&limit=100`);
        if (!r.ok) return;
        const d = await r.json();
        if (after === 0) {
          setPosts(d.posts || []);
          setLiked(d.liked || []);
          lastId.current = d.posts?.length ? d.posts[d.posts.length - 1].id : 0;
        } else if (d.posts?.length) {
          setPosts((prev) => {
            const have = new Set(prev.map((p) => p.id));
            const fresh = d.posts.filter((p) => !have.has(p.id));
            if (!fresh.length) return prev;
            lastId.current = Math.max(lastId.current, ...fresh.map((p) => p.id));
            setNewIds((s) => new Set([...s, ...fresh.map((p) => p.id)]));
            setLiked((l) => [...new Set([...l, ...(d.liked || [])])]);
            return [...prev, ...fresh];
          });
        }
      } catch {}
    };

    fetchPosts(0);
    const id = setInterval(() => {
      if (!document.hidden && liveOn.current) fetchPosts(lastId.current);
    }, POLL_MS);
    const onVis = () => {
      if (!document.hidden) fetchPosts(lastId.current);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [id, loadThread]);

  const reply = async (text) => {
    const r = await fetch(`/api/threads/${id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return d.error || 'Failed to post.';
    setPosts((prev) => [...prev, d.post]);
    lastId.current = Math.max(lastId.current, d.post.id);
    setThread((t) => (t ? { ...t, post_count: (t.post_count ?? 0) + 1 } : t));
    return '';
  };

  const adminPatch = async (patch) => {
    const r = await fetch(`/api/threads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (r.ok) loadThread();
  };

  if (missing) return <div className="empty">Thread not found. It may have been deleted. 🤷</div>;
  if (!thread) return <div className="loading">Loading thread…</div>;

  const locked = !!thread.is_locked;

  return (
    <>
      <div className="thread-head">
        <Link href={`/c/${thread.category_slug}`} className="small">
          ← {thread.category_name}
        </Link>
        <h1>
          {thread.is_pinned ? '📌 ' : ''}
          {locked ? '🔒 ' : ''}
          {thread.title}
        </h1>
        <div className="thread-head-meta">
          <img src={thread.author_avatar || '/avatar.png'} alt="" className="avatar avatar-xs" />
          <span>
            by <Link href={`/u/${thread.author}`}>@{thread.author}</Link>
          </span>
          <span>· {timeAgo(thread.created_at)}</span>
          <span>· 💬 {thread.post_count} posts</span>
          <span>· 👁 {thread.views} views</span>
          <span className="live-dot">LIVE</span>
        </div>
        {me?.is_admin ? (
          <div className="admin-bar">
            <span className="pill pill-admin">admin</span>
            <button className="btn btn-sm" onClick={() => adminPatch({ is_pinned: thread.is_pinned ? 0 : 1 })}>
              {thread.is_pinned ? 'Unpin 📌' : 'Pin 📌'}
            </button>
            <button className="btn btn-sm" onClick={() => adminPatch({ is_locked: locked ? 0 : 1 })}>
              {locked ? 'Unlock 🔓' : 'Lock 🔒'}
            </button>
          </div>
        ) : null}
        {locked && (
          <div className="db-warning" style={{ marginTop: 12 }}>
            🔒 This thread is locked. Only admins can reply.
          </div>
        )}
      </div>

      <div className="card">
        {posts.map((p, i) => (
          <PostCard
            key={p.id}
            post={p}
            liked={liked.includes(p.id)}
            me={me}
            isOP={i === 0}
            flash={newIds.has(p.id)}
            onDelete={(id) => {
              setPosts((prev) => prev.filter((x) => x.id !== id));
              setThread((t) => (t ? { ...t, post_count: Math.max(0, (t.post_count ?? 1) - 1) } : t));
            }}
          />
        ))}
      </div>

      {me ? (
        locked && !me.is_admin ? null : (
          <Composer onSubmit={reply} placeholder="Write a reply…" submitLabel="Reply 💬" />
        )
      ) : (
        <div className="card card-pad" style={{ marginTop: 18, textAlign: 'center' }}>
          <a href="/api/auth/github" className="btn btn-primary">
            Sign in with GitHub to reply
          </a>
        </div>
      )}
    </>
  );
}
