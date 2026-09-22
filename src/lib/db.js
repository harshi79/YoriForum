import { getCloudflareContext } from '@opennextjs/cloudflare';
import { SCHEMA_SQL, SEED_CATEGORIES, WELCOME_THREAD } from './schema';

// ---------- context ----------

export async function getEnv() {
  try {
    const ctx = await getCloudflareContext();
    return ctx?.env ?? {};
  } catch {
    return {};
  }
}

async function rawDb() {
  try {
    const ctx = await getCloudflareContext();
    return ctx?.env?.DB ?? null;
  } catch {
    return null;
  }
}

/**
 * Version-proof route param: returns the path segment after a marker.
 * e.g. /api/threads/42/posts + 'threads' -> '42'
 */
export function segAfter(req, marker) {
  const segs = new URL(req.url).pathname.split('/').filter(Boolean);
  const i = segs.lastIndexOf(marker);
  return i >= 0 && segs[i + 1] ? decodeURIComponent(segs[i + 1]) : '';
}

// ---------- tiny query helpers (D1) ----------

/** @returns {Promise<any[]>} */
export async function qAll(d, sql, params = []) {
  const r = await d.prepare(sql).bind(...params).all();
  return r.results ?? [];
}

/** @returns {Promise<any|null>} */
export async function qFirst(d, sql, params = []) {
  return (await d.prepare(sql).bind(...params).first()) ?? null;
}

export async function qRun(d, sql, params = []) {
  const r = await d.prepare(sql).bind(...params).run();
  return { id: r.meta?.last_row_id ?? null, changes: r.meta?.changes ?? 0 };
}

export const now = () => new Date().toISOString();

export function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, { status, headers: extraHeaders });
}

// ---------- self-initializing database ----------
// Runs once per isolate. CREATE TABLE IF NOT EXISTS + INSERT OR IGNORE
// make this safe to run concurrently on cold starts.

let ensured = false;

async function seed(d) {
  const t = now();
  for (const c of SEED_CATEGORIES) {
    await qRun(
      d,
      `INSERT OR IGNORE INTO categories (slug, name, description, color, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [c.slug, c.name, c.description, c.color, c.sort, t]
    );
  }
  // System user + welcome thread so the forum is never an empty void.
  await qRun(
    d,
    `INSERT OR IGNORE INTO users (github_id, username, avatar_url, bio, is_admin, created_at)
     VALUES ('system', 'yoribot', 'https://github.com/github.png', 'Official YoriForum bot 🤖', 0, ?)`,
    [t]
  );
  const existing = await qFirst(d, 'SELECT id FROM threads LIMIT 1');
  if (!existing) {
    const bot = await qFirst(d, `SELECT id FROM users WHERE username = 'yoribot'`);
    const cat = await qFirst(d, `SELECT id FROM categories WHERE slug = 'announcements'`);
    if (bot && cat) {
      const th = await qRun(
        d,
        `INSERT INTO threads (category_id, user_id, title, post_count, last_post_at, created_at)
         VALUES (?, ?, ?, 1, ?, ?)`,
        [cat.id, bot.id, WELCOME_THREAD.title, t, t]
      );
      if (th.id) {
        await qRun(d, `INSERT INTO posts (thread_id, user_id, body, created_at) VALUES (?, ?, ?, ?)`, [
          th.id,
          bot.id,
          WELCOME_THREAD.body,
          t,
        ]);
      }
    }
  }
}

/**
 * Get the D1 database (self-initializing). Returns null when running
 * outside the Cloudflare runtime — callers should return a 503.
 */
export async function db() {
  const d = await rawDb();
  if (!d) return null;
  if (!ensured) {
    // D1's exec() is single-statement on some builds, so split + batch.
    const stmts = SCHEMA_SQL.split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    await d.batch(stmts.map((s) => d.prepare(s)));
    await seed(d);
    ensured = true;
  }
  return d;
}
