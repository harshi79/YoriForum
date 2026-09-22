import { db, qFirst, qRun, now, json, segAfter } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { notifyLike } from '@/lib/notify';

export const runtime = 'nodejs';

// POST toggles the like. Returns { liked, like_count }.
export async function POST(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const user = await getUser(database, req);
  if (!user) return json({ error: 'Sign in required' }, 401);

  const id = Number(segAfter(req, 'posts'));
  if (!Number.isInteger(id)) return json({ error: 'Bad post id' }, 400);
  const post = await qFirst(database, 'SELECT * FROM posts WHERE id = ?', [id]);
  if (!post) return json({ error: 'Post not found' }, 404);

  const existing = await qFirst(database, 'SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [id, user.id]);
  let liked;
  if (existing) {
    await qRun(database, 'DELETE FROM likes WHERE post_id = ? AND user_id = ?', [id, user.id]);
    await qRun(database, 'UPDATE posts SET like_count = like_count - 1 WHERE id = ?', [id]);
    liked = false;
  } else {
    await qRun(database, 'INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)', [id, user.id, now()]);
    await qRun(database, 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [id]);
    liked = true;
    notifyLike(database, { post, liker: user }).catch(() => {});
  }
  const row = await qFirst(database, 'SELECT like_count FROM posts WHERE id = ?', [id]);
  return json({ liked, like_count: row?.like_count ?? 0 });
}
