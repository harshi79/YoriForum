import { db, qAll, json } from '@/lib/db';

export const runtime = 'nodejs';

function likeEscape(s) {
  return s.replace(/[\\%_]/g, (c) => '\\' + c);
}

export async function GET(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 60);
  if (q.length < 2) return json({ threads: [], users: [] });
  const pattern = `%${likeEscape(q)}%`;

  const threads = await qAll(
    database,
    `SELECT t.id, t.title, t.post_count, t.last_post_at,
       u.username AS author, c.slug AS category_slug, c.name AS category_name
     FROM threads t
     JOIN users u ON u.id = t.user_id
     JOIN categories c ON c.id = t.category_id
     WHERE t.title LIKE ? ESCAPE '\\'
     ORDER BY t.last_post_at DESC LIMIT 10`,
    [pattern]
  );
  const users = await qAll(
    database,
    `SELECT username, avatar_url FROM users WHERE username LIKE ? ESCAPE '\\' ORDER BY username LIMIT 8`,
    [pattern]
  );
  return json({ threads, users });
}
