'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginInner() {
  const sp = useSearchParams();
  const error = sp.get('error');
  return (
    <div className="center-wrap">
      <div className="login-card">
        <div style={{ fontSize: '3rem' }}>⚡</div>
        <h1>Join YoriForum</h1>
        <p className="muted">
          One click with GitHub — no passwords, no spam. Your avatar and username come along automatically.
        </p>
        {error && <div className="form-error">{error}</div>}
        <a href="/api/auth/github" className="btn btn-primary big-btn">
          Sign in with GitHub
        </a>
        <p className="small muted" style={{ marginTop: 16 }}>
          We only read your public profile. First member becomes admin 👑
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
