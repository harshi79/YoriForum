import { db, qFirst, json, now } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const [u, t, p, o] = await Promise.all([
    qFirst(database, 'SELECT COUNT(*) AS n FROM users'),
    qFirst(database, 'SELECT COUNT(*) AS n FROM threads'),
    qFirst(database, 'SELECT COUNT(*) AS n FROM posts'),
    qFirst(database, 'SELECT COUNT(*) AS n FROM sessions WHERE expires_at > ?', [now()]),
  ]);
  return json({
    users: u?.n ?? 0,
    threads: t?.n ?? 0,
    posts: p?.n ?? 0,
    online: o?.n ?? 0,
  });
}
