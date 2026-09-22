import { db, qAll, qFirst, qRun, now, json } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { checkRate } from '@/lib/rate';
import { notifyReply } from '@/lib/notify';

export const runtime = 'nodejs';

const PAGE_SIZE = 20;

export async function GET(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const sp = new URL(req.url).searchParams;
  const category = (sp.get('category') || '').trim().slice(0, 60);
  const sort = sp.get('sort') === 'top' ? 'top' : 'latest';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = category ? 'WHERE c.slug = ?' : '';
  const params = category ? [category] : [];
  const order =
    sort === 'top'
      ? 'ORDER BY t.is_pinned DESC, t.post_count DESC, t.views DESC'
      : 'ORDER BY t.is_pinned DESC, t.last_post_at DESC';

  const threads = await qAll(
    database,
    `SELECT t.id, t.title, t.is_pinned, t.is_locked, t.views, t.post_count,
       t.last_post_at, t.created_at,
       u.username AS author, u.avatar_url AS author_avatar,
       c.slug AS category_slug, c.name AS category_name, c.color AS category_color,
       substr((SELECT p.body FROM posts p WHERE p.thread_id = t.id ORDER BY p.id ASC LIMIT 1), 1, 180) AS excerpt
     FROM threads t
     JOIN users u ON u.id = t.user_id
     JOIN categories c ON c.id = t.category_id
     ${where} ${order} LIMIT ${PAGE_SIZE} OFFSET ?`,
    [...params, offset]
  );

  const countRow = await qFirst(
    database,
    `SELECT COUNT(*) AS n FROM threads t JOIN categories c ON c.id = t.category_id ${where}`,
    params
  );
  const total = countRow?.n ?? 0;

  return json({ threads, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)), total });
}

export async function POST(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const [denied, user] = await requireUser(database, req);
  if (denied) return denied;

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const title = String(body.title || '').trim();
  const text = String(body.body || '').trim();
  const categoryId = Number(body.category_id);

  if (title.length < 4 || title.length > 140) return json({ error: 'Title must be 4–140 characters.' }, 400);
  if (text.length < 2 || text.length > 20000) return json({ error: 'Post must be 2–20000 characters.' }, 400);
  if (!Number.isInteger(categoryId)) return json({ error: 'Pick a category.' }, 400);

  const cat = await qFirst(database, 'SELECT id FROM categories WHERE id = ?', [categoryId]);
  if (!cat) return json({ error: 'Category not found.' }, 404);

  const rl = await checkRate(database, user.id, 'thread');
  if (!rl.ok) return json({ error: rl.error }, 429);

  const t = now();
  const th = await qRun(
    database,
    `INSERT INTO threads (category_id, user_id, title, post_count, last_post_at, created_at)
     VALUES (?, ?, ?, 1, ?, ?)`,
    [categoryId, user.id, title, t, t]
  );
  const post = await qRun(database, 'INSERT INTO posts (thread_id, user_id, body, created_at) VALUES (?, ?, ?, ?)', [
    th.id,
    user.id,
    text,
    t,
  ]);

  const thread = await qFirst(database, 'SELECT * FROM threads WHERE id = ?', [th.id]);
  notifyReply(database, { thread, post: { id: post.id, body: text }, author: user }).catch(() => {});

  return json({ id: th.id }, 201);
}
