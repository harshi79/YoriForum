import { qAll, qRun, now } from './db';
import { extractMentions } from './rate';

// Fire-and-forget style notification writers. They await internally so
// callers stay simple; failures shouldn't break posting, so route
// handlers wrap calls in try/catch (or .catch(()=>{})).

export async function notifyReply(d, { thread, post, author }) {
  const t = now();
  const targets = new Map(); // userId -> type (mention wins over reply)

  if (thread.user_id !== author.id) targets.set(thread.user_id, 'reply');

  for (const name of extractMentions(post.body)) {
    if (name === author.username.toLowerCase()) continue;
    const rows = await qAll(d, 'SELECT id FROM users WHERE LOWER(username) = ? LIMIT 1', [name]);
    if (rows.length && rows[0].id !== author.id) targets.set(rows[0].id, 'mention');
  }

  for (const [userId, type] of targets) {
    await qRun(
      d,
      `INSERT INTO notifications (user_id, type, actor_id, thread_id, post_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, author.id, thread.id, post.id, t]
    );
  }
}

export async function notifyLike(d, { post, liker }) {
  if (post.user_id === liker.id) return;
  await qRun(
    d,
    `INSERT INTO notifications (user_id, type, actor_id, thread_id, post_id, created_at)
     VALUES (?, 'like', ?, ?, ?, ?)`,
    [post.user_id, liker.id, post.thread_id, post.id, now()]
  );
}
