// Single source of truth for the D1 schema.
// Applied automatically (idempotently) on first API hit per isolate,
// so local dev, preview and production all self-initialize.

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_locked INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  last_post_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS likes (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  actor_id INTEGER REFERENCES users(id),
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_threads_cat_last ON threads(category_id, last_post_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_last ON threads(last_post_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_user ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON posts(thread_id, id ASC);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read, id DESC);
`;

export const SEED_CATEGORIES = [
  { slug: 'announcements', name: '📢 Announcements', description: 'Official news, releases and updates from the team.', color: '#f59e0b', sort: 1 },
  { slug: 'general', name: '💬 General', description: 'Hang out and talk about anything.', color: '#6366f1', sort: 2 },
  { slug: 'code', name: '💻 Code & Tech', description: 'Programming, code review and tech deep-dives.', color: '#22c55e', sort: 3 },
  { slug: 'showcase', name: '🚀 Showcase', description: 'Show off what you built. Feedback guaranteed.', color: '#ec4899', sort: 4 },
  { slug: 'help', name: '🙋 Help & Support', description: 'Stuck? Ask here — no question too small.', color: '#06b6d4', sort: 5 },
  { slug: 'offtopic', name: '🎲 Off-Topic', description: 'Random stuff that fits nowhere else.', color: '#a78bfa', sort: 6 },
];

export const WELCOME_THREAD = {
  title: '👋 Welcome to YoriForum — read this first!',
  body: `Welcome to **YoriForum**! This forum runs on a 100% free stack (Cloudflare Pages + Workers + D1) and scales to thousands of users without costing a rupee. 💸

**Quick start:**
- Sign in with GitHub (top-right) to post
- Pick a category and hit **+ New thread**
- Mention people with \`@username\` — they'll get notified 🔔
- Threads update **live** — no refresh needed

**Formatting cheatsheet:**
\`inline code\`, **bold**, *italic*, links auto-convert.

\`\`\`js
console.log("hello yori 👋");
\`\`\`

Be kind, don't spam, have fun. 🎉`,
};
