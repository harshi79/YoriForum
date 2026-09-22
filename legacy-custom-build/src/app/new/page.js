'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Composer from '../components/Composer';

function NewThreadForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [cats, setCats] = useState([]);
  const [catId, setCatId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [me, setMe] = useState(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user || null);
        setChecked(true);
      })
      .catch(() => setChecked(true));
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        const list = d.categories || [];
        setCats(list);
        const pre = sp.get('category');
        const match = list.find((c) => c.slug === pre);
        if (match) setCatId(String(match.id));
      })
      .catch(() => {});
  }, [sp]);

  const submit = async () => {
    if (title.trim().length < 4) {
      setError('Title must be at least 4 characters.');
      return;
    }
    if (!catId) {
      setError('Pick a category.');
      return;
    }
    if (body.trim().length < 2) {
      setError('Write something in the post body first.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), category_id: Number(catId) }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error || 'Failed to create thread.');
        setBusy(false);
        return;
      }
      router.push(`/t/${d.id}`);
    } catch {
      setError('Something went wrong. Try again.');
      setBusy(false);
    }
  };

  if (!checked) return <div className="loading">Loading…</div>;
  if (!me)
    return (
      <div className="center-wrap">
        <div className="login-card">
          <h1>🔐 Sign in to post</h1>
          <p className="muted">You need a GitHub account to start a thread. It takes 10 seconds.</p>
          <a href="/api/auth/github" className="btn btn-primary big-btn">
            Sign in with GitHub
          </a>
        </div>
      </div>
    );

  return (
    <>
      <div className="thread-head">
        <h1>✨ New thread</h1>
        <div className="thread-head-meta">Posting as @{me.username}</div>
      </div>
      <div className="card card-pad">
        <div className="form-row">
          <label>Category</label>
          <select className="select" value={catId} onChange={(e) => setCatId(e.target.value)}>
            <option value="">— pick one —</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Title</label>
          <input
            className="input"
            placeholder="Give it a clear, catchy title…"
            value={title}
            maxLength={140}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Opening post</label>
          <div style={{ marginTop: -18 }}>
            <Composer
              onSubmit={async (text) => {
                setBody(text);
                return '';
              }}
              placeholder="What's on your mind? Markdown-lite supported…"
              submitLabel="Save draft ↓"
              rows={8}
            />
          </div>
          {body && (
            <div className="small muted" style={{ marginTop: 8 }}>
              ✅ Draft saved ({body.length} chars). Hit <strong>Publish thread</strong> when ready — or edit above and
              save again.
            </div>
          )}
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary" onClick={submit} disabled={busy} style={{ marginTop: 6 }}>
          {busy ? 'Publishing…' : '🚀 Publish thread'}
        </button>
      </div>
    </>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <NewThreadForm />
    </Suspense>
  );
}
