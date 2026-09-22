import { db, qFirst, qRun, json, segAfter } from '@/lib/db';
import { getUser } from '@/lib/auth';

export const runtime = 'nodejs';

// DELETE a post. Authors can delete their own; admins can delete anything.
// Deleting the opening post deletes the whole thread.
export async function DELETE(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const user = await getUser(database, req);
  if (!user) return json({ error: 'Sign in required' }, 401);

  const id = Number(segAfter(req, 'posts'));
  if (!Number.isInteger(id)) return json({ error: 'Bad post id' }, 400);
  const post = await qFirst(database, 'SELECT * FROM posts WHERE id = ?', [id]);
  if (!post) return json({ error: 'Post not found' }, 404);
  if (post.user_id !== user.id && !user.is_admin) return json({ error: 'Not yours to delete' }, 403);

  const first = await qFirst(database, 'SELECT id FROM posts WHERE thread_id = ? ORDER BY id ASC LIMIT 1', [
    post.thread_id,
  ]);
  if (first && first.id === post.id) {
    // Opening post -> nuke the thread (posts/likes/notifications cascade).
    await qRun(database, 'DELETE FROM threads WHERE id = ?', [post.thread_id]);
    return json({ ok: true, deletedThread: true });
  }

  await qRun(database, 'DELETE FROM posts WHERE id = ?', [id]);
  await qRun(database, 'UPDATE threads SET post_count = post_count - 1 WHERE id = ?', [post.thread_id]);
  // Fix last_post_at from remaining posts.
  const last = await qFirst(database, 'SELECT MAX(created_at) AS m FROM posts WHERE thread_id = ?', [post.thread_id]);
  if (last?.m) await qRun(database, 'UPDATE threads SET last_post_at = ? WHERE id = ?', [last.m, post.thread_id]);
  return json({ ok: true });
}
