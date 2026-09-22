import { qFirst } from './db';

// D1-backed rate limits — no extra infra needed.
// Generous enough for humans, tight enough to blunt spam scripts.

const LIMITS = {
  thread: { table: 'threads', windowSec: 3600, max: 10 }, // 10 threads/hour
  post: { table: 'posts', windowSec: 60, max: 6 }, // 6 posts/minute
};

/** @returns {Promise<{ok:true}|{ok:false, error:string}>} */
export async function checkRate(d, userId, kind) {
  const cfg = LIMITS[kind];
  if (!cfg) return { ok: true };
  const since = new Date(Date.now() - cfg.windowSec * 1000).toISOString();
  const row = await qFirst(d, `SELECT COUNT(*) AS n FROM ${cfg.table} WHERE user_id = ? AND created_at > ?`, [
    userId,
    since,
  ]);
  if (row && row.n >= cfg.max) {
    return { ok: false, error: `Slow down! Limit is ${cfg.max} per ${cfg.windowSec >= 3600 ? 'hour' : 'minute'} ⏳` };
  }
  return { ok: true };
}

export function extractMentions(body) {
  const found = new Set();
  const re = /(^|\W)@([a-zA-Z0-9-]{1,39})/g;
  let m;
  while ((m = re.exec(body || '')) !== null) found.add(m[2].toLowerCase());
  return [...found].slice(0, 10);
}
