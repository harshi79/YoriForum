'use client';

import { useState } from 'react';
import { formatBody } from '@/lib/format';

export default function Composer({ onSubmit, placeholder, submitLabel = 'Post', rows = 5, autoFocus = false }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (busy || text.trim().length < 2) return;
    setBusy(true);
    setError('');
    try {
      const err = await onSubmit(text.trim());
      if (err) setError(err);
      else setText('');
    } catch {
      setError('Something went wrong. Try again.');
    }
    setBusy(false);
  };

  return (
    <div className="composer">
      <div className="composer-tabs">
        <button className={!preview ? 'active' : ''} onClick={() => setPreview(false)} type="button">
          ✍️ Write
        </button>
        <button className={preview ? 'active' : ''} onClick={() => setPreview(true)} type="button">
          👁 Preview
        </button>
        <span className="composer-hint">**bold** · *italic* · `code` · @mention · links auto-convert</span>
      </div>
      {preview ? (
        <div className="composer-preview post-content" dangerouslySetInnerHTML={{ __html: formatBody(text) || '<span class="muted">Nothing to preview yet…</span>' }} />
      ) : (
        <textarea
          className="textarea"
          rows={rows}
          placeholder={placeholder || 'Say something nice…'}
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit();
          }}
        />
      )}
      {error && <div className="form-error">{error}</div>}
      <div className="composer-foot">
        <span className="muted small">{text.length}/20000 · Ctrl+Enter to post</span>
        <button className="btn btn-primary" onClick={submit} disabled={busy || text.trim().length < 2}>
          {busy ? 'Posting…' : submitLabel}
        </button>
      </div>
    </div>
  );
}
