import { db, qAll, qFirst, json } from '@/lib/db';
import { getUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const user = await getUser(database, req);
  if (!user) return json({ error: 'Sign in required' }, 401);

  const sp = new URL(req.url).searchParams;
  const unreadOnly = sp.get('unread_only') === '1';
  const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '20', 10) || 20));

  const items = await qAll(
    database,
    `SELECT n.id, n.type, n.thread_id, n.post_id, n.is_read, n.created_at,
       a.username AS actor, a.avatar_url AS actor_avatar,
       t.title AS thread_title
     FROM notifications n
     LEFT JOIN users a ON a.id = n.actor_id
     LEFT JOIN threads t ON t.id = n.thread_id
     WHERE n.user_id = ? ${unreadOnly ? 'AND n.is_read = 0' : ''}
     ORDER BY n.id DESC LIMIT ?`,
    [user.id, limit]
  );
  const unread = await qFirst(database, 'SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0', [
    user.id,
  ]);
  return json({ items, unread: unread?.n ?? 0 });
}
