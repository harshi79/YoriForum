import { db, qAll, json } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const rows = await qAll(
    database,
    `SELECT c.*,
       (SELECT COUNT(*) FROM threads t WHERE t.category_id = c.id) AS thread_count,
       (SELECT COUNT(*) FROM posts p JOIN threads t ON t.id = p.thread_id WHERE t.category_id = c.id) AS post_count,
       (SELECT MAX(t.last_post_at) FROM threads t WHERE t.category_id = c.id) AS last_active
     FROM categories c ORDER BY c.sort_order ASC`
  );
  return json({ categories: rows });
}
