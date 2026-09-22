import { db, qAll, qFirst, json, segAfter } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const username = String(segAfter(req, 'users') || '').slice(0, 39);
  const user = await qFirst(
    database,
    'SELECT id, username, avatar_url, bio, is_admin, created_at FROM users WHERE LOWER(username) = LOWER(?)',
    [username]
  );
  if (!user) return json({ error: 'User not found' }, 404);

  const [tc, pc] = await Promise.all([
    qFirst(database, 'SELECT COUNT(*) AS n FROM threads WHERE user_id = ?', [user.id]),
    qFirst(database, 'SELECT COUNT(*) AS n FROM posts WHERE user_id = ?', [user.id]),
  ]);
  const threads = await qAll(
    database,
    `SELECT t.id, t.title, t.post_count, t.last_post_at, c.slug AS category_slug, c.name AS category_name
     FROM threads t JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = ? ORDER BY t.created_at DESC LIMIT 8`,
    [user.id]
  );
  const posts = await qAll(
    database,
    `SELECT p.id, p.thread_id, substr(p.body, 1, 160) AS snippet, p.created_at, t.title AS thread_title
     FROM posts p JOIN threads t ON t.id = p.thread_id
     WHERE p.user_id = ? ORDER BY p.id DESC LIMIT 8`,
    [user.id]
  );
  return json({ user, stats: { threads: tc?.n ?? 0, posts: pc?.n ?? 0 }, threads, posts });
}
