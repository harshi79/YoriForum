import { db, qAll, qFirst, qRun, now, json, segAfter } from '@/lib/db';
import { getUser, requireUser } from '@/lib/auth';
import { checkRate } from '@/lib/rate';
import { notifyReply } from '@/lib/notify';

export const runtime = 'nodejs';

// GET ?after=<postId> powers the live feed: returns only newer posts.
export async function GET(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const threadId = Number(segAfter(req, 'threads'));
  if (!Number.isInteger(threadId)) return json({ error: 'Bad thread id' }, 400);

  const sp = new URL(req.url).searchParams;
  const after = Math.max(0, parseInt(sp.get('after') || '0', 10) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '50', 10) || 50));

  const thread = await qFirst(database, 'SELECT id, post_count FROM threads WHERE id = ?', [threadId]);
  if (!thread) return json({ error: 'Thread not found' }, 404);

  const posts = await qAll(
    database,
    `SELECT p.id, p.thread_id, p.body, p.like_count, p.created_at,
       u.id AS user_id, u.username AS author, u.avatar_url AS author_avatar
     FROM posts p JOIN users u ON u.id = p.user_id
     WHERE p.thread_id = ? AND p.id > ?
     ORDER BY p.id ASC LIMIT ?`,
    [threadId, after, limit]
  );

  let liked = [];
  const viewer = await getUser(database, req);
  if (viewer && posts.length) {
    const rows = await qAll(
      database,
      `SELECT l.post_id AS id FROM likes l JOIN posts p ON p.id = l.post_id
       WHERE l.user_id = ? AND p.thread_id = ?`,
      [viewer.id, threadId]
    );
    liked = rows.map((r) => r.id);
  }

  return json({ posts, liked, post_count: thread.post_count });
}

export async function POST(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const [denied, user] = await requireUser(database, req);
  if (denied) return denied;

  const threadId = Number(segAfter(req, 'threads'));
  if (!Number.isInteger(threadId)) return json({ error: 'Bad thread id' }, 400);
  const thread = await qFirst(database, 'SELECT * FROM threads WHERE id = ?', [threadId]);
  if (!thread) return json({ error: 'Thread not found' }, 404);
  if (thread.is_locked && !user.is_admin) return json({ error: '🔒 This thread is locked.' }, 403);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const text = String(body.body || '').trim();
  if (text.length < 2 || text.length > 20000) return json({ error: 'Reply must be 2–20000 characters.' }, 400);

  const rl = await checkRate(database, user.id, 'post');
  if (!rl.ok) return json({ error: rl.error }, 429);

  const t = now();
  const r = await qRun(database, 'INSERT INTO posts (thread_id, user_id, body, created_at) VALUES (?, ?, ?, ?)', [
    threadId,
    user.id,
    text,
    t,
  ]);
  await qRun(database, 'UPDATE threads SET post_count = post_count + 1, last_post_at = ? WHERE id = ?', [t, threadId]);

  const post = await qFirst(
    database,
    `SELECT p.id, p.thread_id, p.body, p.like_count, p.created_at,
       u.id AS user_id, u.username AS author, u.avatar_url AS author_avatar
     FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`,
    [r.id]
  );

  notifyReply(database, { thread, post: { id: r.id, body: text }, author: user }).catch(() => {});
  return json({ post }, 201);
}
