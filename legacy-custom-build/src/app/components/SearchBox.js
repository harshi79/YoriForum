'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function SearchBox() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState({ threads: [], users: [] });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setRes({ threads: [], users: [] });
      setBusy(false);
      return;
    }
    setBusy(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        if (r.ok) setRes(await r.json());
      } catch {}
      setBusy(false);
    }, 250);
    return () => clearTimeout(timer.current);
  }, [q]);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const show = open && (res.threads.length > 0 || res.users.length > 0);

  return (
    <div className="searchbox" ref={boxRef}>
      <span className="search-icon">🔍</span>
      <input
        className="input search-input"
        placeholder="Search threads, people…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      />
      {busy && <span className="search-spin" />}
      {show && (
        <div className="search-results">
          {res.threads.map((t) => (
            <Link key={`t${t.id}`} href={`/t/${t.id}`} className="search-row" onClick={() => setOpen(false)}>
              <span className="search-row-title">🧵 {t.title}</span>
              <span className="search-row-meta">
                {t.category_name} · {t.post_count} replies · by {t.author}
              </span>
            </Link>
          ))}
          {res.users.map((u) => (
            <Link key={`u${u.username}`} href={`/u/${u.username}`} className="search-row" onClick={() => setOpen(false)}>
              <span className="search-row-title">
                <img src={u.avatar_url} alt="" className="avatar avatar-xs" /> @{u.username}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
