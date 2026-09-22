import { db, json } from '@/lib/db';
import { getUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const user = await getUser(database, req);
  return json({ user });
}
