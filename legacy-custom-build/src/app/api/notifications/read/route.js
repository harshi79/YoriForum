import { db, qRun, json } from '@/lib/db';
import { getUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const user = await getUser(database, req);
  if (!user) return json({ error: 'Sign in required' }, 401);

  let body = {};
  try {
    body = await req.json();
  } catch {
    /* empty body = mark all */
  }
  if (Array.isArray(body.ids) && body.ids.length) {
    const ids = body.ids.map(Number).filter(Number.isInteger).slice(0, 100);
    if (ids.length) {
      const placeholders = ids.map(() => '?').join(',');
      await qRun(database, `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`, [
        user.id,
        ...ids,
      ]);
    }
  } else {
    await qRun(database, 'UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user.id]);
  }
  return json({ ok: true });
}
