'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatBody } from '@/lib/format';
import { timeAgo, fullDate } from '@/lib/time';

export default function PostCard({ post, liked: initiallyLiked, me, isOP, flash, onDelete }) {
  const [liked, setLiked] = useState(!!initiallyLiked);
  const [count, setCount] = useState(post.like_count ?? 0);
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);

  const toggleLike = async () => {
    if (!me) {
      window.location.href = '/login';
      return;
    }
    if (busy) return;
    setBusy(true);
    // Optimistic UI
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));
    try {
      const r = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      if (r.ok) {
        const d = await r.json();
        setLiked(d.liked);
        setCount(d.like_count);
      }
    } catch {}
    setBusy(false);
  };

  const del = async () => {
    if (!confirm(isOP ? 'Delete this entire thread? This cannot be undone.' : 'Delete this post?')) return;
    const r = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    if (r.ok) {
      const d = await r.json();
      if (d.deletedThread) {
        window.location.href = '/';
        return;
      }
      setGone(true);
      onDelete?.(post.id);
    }
  };

  if (gone) return null;
  const canDelete = me && (me.id === post.user_id || me.is_admin);

  return (
    <article id={`post-${post.id}`} className={`post${flash ? ' post-flash' : ''}`}>
      <Link href={`/u/${post.author}`} className="post-avatar">
        <img src={post.author_avatar || '/avatar.png'} alt={post.author} className="avatar avatar-md" />
      </Link>
      <div className="post-body">
        <div className="post-head">
          <Link href={`/u/${post.author}`} className="post-author">
            @{post.author}
          </Link>
          {isOP && <span className="pill pill-op">OP</span>}
          <span className="post-time" title={fullDate(post.created_at)}>
            {timeAgo(post.created_at)}
          </span>
          <span className="post-num">#{post.id}</span>
        </div>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: formatBody(post.body) }} />
        <div className="post-actions">
          <button className={`like-btn${liked ? ' liked' : ''}`} onClick={toggleLike} disabled={busy}>
            {liked ? '❤️' : '🤍'} {count}
          </button>
          {canDelete && (
            <button className="link-btn danger" onClick={del}>
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
