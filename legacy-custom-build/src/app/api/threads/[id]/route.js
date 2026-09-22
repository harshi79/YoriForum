import { db, qFirst, qRun, json, segAfter } from '@/lib/db';
import { getUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const id = Number(segAfter(req, 'threads'));
  if (!Number.isInteger(id)) return json({ error: 'Bad thread id' }, 400);

  const thread = await qFirst(
    database,
    `SELECT t.*, u.username AS author, u.avatar_url AS author_avatar,
       c.slug AS category_slug, c.name AS category_name, c.color AS category_color
     FROM threads t
     JOIN users u ON u.id = t.user_id
     JOIN categories c ON c.id = t.category_id
     WHERE t.id = ?`,
    [id]
  );
  if (!thread) return json({ error: 'Thread not found' }, 404);

  // Count the view (best-effort, don't fail the request if it errors).
  qRun(database, 'UPDATE threads SET views = views + 1 WHERE id = ?', [id]).catch(() => {});
  return json({ thread });
}

// Admin: pin / lock / unpin / unlock
export async function PATCH(req) {
  const database = await db();
  if (!database) return json({ error: 'Database unavailable' }, 503);
  const user = await getUser(database, req);
  if (!user || !user.is_admin) return json({ error: 'Admins only' }, 403);

  const id = Number(segAfter(req, 'threads'));
  if (!Number.isInteger(id)) return json({ error: 'Bad thread id' }, 400);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const updates = [];
  const values = [];
  if (body.is_pinned === 0 || body.is_pinned === 1) {
    updates.push('is_pinned = ?');
    values.push(body.is_pinned);
  }
  if (body.is_locked === 0 || body.is_locked === 1) {
    updates.push('is_locked = ?');
    values.push(body.is_locked);
  }
  if (!updates.length) return json({ error: 'Nothing to update' }, 400);
  values.push(id);
  await qRun(database, `UPDATE threads SET ${updates.join(', ')} WHERE id = ?`, values);
  return json({ ok: true });
}
