import { qFirst, qRun, now, json } from './db';

const COOKIE = 'yori_session';
const SESSION_DAYS = 30;

export function parseCookies(req) {
  const out = {};
  const header = req.headers.get('cookie');
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export async function sha256hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function newToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '');
}

function cookieFlags(req, maxAge) {
  const proto = new URL(req.url).protocol;
  const secure = proto === 'https:' ? '; Secure' : '';
  return `${COOKIE}=%s; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function setSessionCookie(req, token) {
  return cookieFlags(req, SESSION_DAYS * 86400).replace('%s', token);
}

export function clearSessionCookie(req) {
  return cookieFlags(req, 0).replace('%s', '');
}

export async function createSession(d, userId) {
  const token = newToken();
  const hash = await sha256hex(token);
  const t = now();
  const exp = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await qRun(d, 'INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)', [
    hash,
    userId,
    t,
    exp,
  ]);
  return token;
}

export async function destroySession(d, req) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return;
  await qRun(d, 'DELETE FROM sessions WHERE token_hash = ?', [await sha256hex(token)]);
}

/** @returns {Promise<{id,username,...}|null>} */
export async function getUser(d, req) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return null;
  const s = await qFirst(d, 'SELECT user_id, expires_at FROM sessions WHERE token_hash = ?', [
    await sha256hex(token),
  ]);
  if (!s) return null;
  if (s.expires_at < now()) {
    await qRun(d, 'DELETE FROM sessions WHERE token_hash = ?', [await sha256hex(token)]);
    return null;
  }
  return qFirst(
    d,
    'SELECT id, github_id, username, avatar_url, bio, is_admin, created_at FROM users WHERE id = ?',
    [s.user_id]
  );
}

/** Helper: require logged-in user or return [response|null, user|null]. */
export async function requireUser(d, req) {
  const user = await getUser(d, req);
  if (!user) return [json({ error: 'Sign in required' }, 401), null];
  return [null, user];
}
