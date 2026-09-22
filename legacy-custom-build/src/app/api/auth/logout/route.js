import { db, json } from '@/lib/db';
import { destroySession, clearSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  await destroySession(database, req);
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(req) });
}
