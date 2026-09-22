'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ThreadRow from '../../components/ThreadRow';

export default function CategoryPage() {
  const { slug } = useParams();
  const [cat, setCat] = useState(null);
  const [threads, setThreads] = useState([]);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await fetch('/api/categories').then((r) => r.json());
      const found = (c.categories || []).find((x) => x.slug === slug);
      if (!found) {
        setMissing(true);
        return;
      }
      setCat(found);
      const t = await fetch(`/api/threads?category=${slug}&sort=${sort}&page=${page}`).then((r) => r.json());
      setThreads(t.threads || []);
      setTotalPages(t.totalPages || 1);
    } catch {}
    setLoading(false);
  }, [slug, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (missing) return <div className="empty">Category not found. 🤷</div>;
  if (loading && !cat) return <div className="loading">Loading…</div>;

  return (
    <>
      <div className="thread-head">
        <Link href="/" className="small muted">
          ← All categories
        </Link>
        <h1>{cat?.name}</h1>
        <div className="thread-head-meta">
          <span>{cat?.description}</span>
          <span>
            · 🧵 {cat?.thread_count} threads · 💬 {cat?.post_count} posts
          </span>
        </div>
      </div>

      <div className="section-head">
        <div className="tabs">
          <button className={`tab${sort === 'latest' ? ' active' : ''}`} onClick={() => { setSort('latest'); setPage(1); }}>
            🕒 Latest
          </button>
          <button className={`tab${sort === 'top' ? ' active' : ''}`} onClick={() => { setSort('top'); setPage(1); }}>
            🔥 Top
          </button>
        </div>
        <span className="spacer" />
        <Link href={`/new?category=${slug}`} className="btn btn-primary btn-sm">
          + New thread
        </Link>
      </div>

      <div className="card">
        {loading && <div className="loading">Loading threads…</div>}
        {!loading && threads.length === 0 && <div className="empty">Nothing here yet. Start the first thread! 🚀</div>}
        {threads.map((t) => (
          <ThreadRow key={t.id} t={t} />
        ))}
        {totalPages > 1 && (
          <div className="pager">
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
