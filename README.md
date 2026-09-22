# ⚡ YoriForum

A fast, modern, **scalable community forum that costs $0 to run** — Next.js on Cloudflare Workers + D1.

Sign in with GitHub, start threads, get live replies and notifications. No servers to manage, no credit card required.

---

## ✨ Features

- 🔐 **GitHub-only login** — no passwords, free avatar + username sync
- 🧵 **Categories, threads, replies** with pinned / locked states (admin)
- ⚡ **Live threads** — new replies appear automatically, no refresh (smart incremental polling)
- 🔔 **Notifications** — replies, @mentions, likes + unread bell (auto-updating)
- ❤️ **Likes**, 👁 **view counts**, 🔍 **instant search** (threads + people)
- 👤 **Profiles** with stats + recent activity
- 🛡 **Spam guards** — rate limits (6 posts/min, 10 threads/hour), D1-backed, zero extra infra
- 📝 **Markdown-lite** — bold, italic, code blocks, auto-links, @mentions (XSS-safe)
- 📱 **Responsive dark UI**, zero CSS framework, zero image optimizer bills
- 🌱 **Self-seeding database** — schema + categories + welcome thread auto-create on first run

## 🏗 Architecture

```
Browser ──HTTPS──▶ Cloudflare edge (200+ cities)
                      │
                      ├─ Static assets (JS/CSS, cached, free unlimited bandwidth*)
                      └─ Worker: Next.js app (SSR + API routes)
                              │
                              ├─ D1 (SQLite at the edge) — users, threads, posts, …
                              └─ GitHub OAuth — login only (no DB in GitHub, see FAQ)
```

| Layer    | Tech                              | Free tier (no card)                              |
|----------|-----------------------------------|--------------------------------------------------|
| Hosting  | Cloudflare Workers                | 100k requests/day free                           |
| Database | D1 (serverless SQLite)            | 5M rows read / 100k rows written per day, 5 GB   |
| Auth     | GitHub OAuth                      | Free forever                                     |
| Media    | GitHub avatars (hotlinked)        | $0 storage                                       |
| Future   | R2 (uploads), Turnstile (captcha) | 10 GB free / unlimited free                      |

Realistic capacity on free tiers: **thousands of daily active users** before touching any limit.

## 🚀 Quickstart (local, 2 min, zero config)

```bash
npm install
npm run dev
# open http://localhost:3000 — local D1 auto-created + seeded 🌱
```

No env vars needed for local dev (GitHub login just needs config to actually sign in — everything else works).

Useful scripts:

| Command           | What it does                                        |
|-------------------|-----------------------------------------------------|
| `npm run dev`     | Dev server + local D1 (Miniflare)                   |
| `npm run build`   | Plain Next.js build (sanity check)                  |
| `npm run preview` | Production Worker build + local preview w/ D1       |
| `npm run deploy`  | Build + deploy to Cloudflare                        |
| `npm run db:create` | Create the production D1 database                 |

## ☁️ Deploy to production (free, ~10 min)

**1. Cloudflare account + login**
- Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) (free, no card)
- `npx wrangler login`

**2. Create the D1 database**
```bash
npm run db:create
# paste the printed database_id into wrangler.toml
```
Schema/seeds apply themselves on first request — nothing to run. 🎉

**3. GitHub OAuth app**
- GitHub → Settings → Developer settings → OAuth Apps → New
- Homepage URL: `https://<your-worker>.workers.dev` (or your domain)
- Callback URL: `https://<your-worker>.workers.dev/api/auth/callback`
- Copy Client ID + Client Secret, then:
```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
# optional: force a specific admin (otherwise first member becomes admin 👑)
npx wrangler secret put ADMIN_GITHUB_USERNAME
```

**4. Deploy**
```bash
npm run deploy
```

**5. (Optional) Custom domain** — Cloudflare dashboard → Workers → your worker → Custom Domains. Free SSL included.

## 🗂 Project structure

```
src/
  app/
    page.js              home: hero stats, categories, live latest-threads
    c/[slug]/            category view (latest / top, pagination)
    t/[id]/              thread view (live polling replies, admin pin/lock)
    new/                 new-thread composer with preview
    u/[username]/        public profile
    notifications/       notification inbox
    login/               GitHub sign-in landing
    components/          Header, ThreadRow, PostCard, Composer, SearchBox
    api/                 REST API (threads, posts, likes, notifications, …)
  lib/
    db.js                D1 helpers + self-initializing schema/seed
    auth.js              sessions (SHA-256 hashed tokens, httpOnly cookies)
    rate.js              rate limits + @mention parsing
    notify.js            notification writers
    format.js            markdown-lite renderer (XSS-safe)
    schema.js            SQL schema + seed data
```

## 🔌 API (short version)

| Method | Endpoint                        | Auth | Notes                              |
|--------|---------------------------------|------|------------------------------------|
| GET    | `/api/threads?category&sort&page`| –    | List (latest/top, 20/page)         |
| POST   | `/api/threads`                  | ✅   | Create thread + OP                 |
| GET    | `/api/threads/:id`              | –    | Detail (+1 view)                   |
| PATCH  | `/api/threads/:id`              | 👑   | Pin / lock                         |
| GET    | `/api/threads/:id/posts?after=` | –    | List / **live poll** newer posts   |
| POST   | `/api/threads/:id/posts`        | ✅   | Reply (+mentions notify)           |
| POST   | `/api/posts/:id/like`           | ✅   | Toggle like                        |
| DELETE | `/api/posts/:id`                | ✅*  | Own post or admin (*OP = thread)   |
| GET    | `/api/notifications`            | ✅   | Inbox + unread count               |
| POST   | `/api/notifications/read`       | ✅   | Mark read (ids or all)             |
| GET    | `/api/search?q=`                | –    | Threads + users                    |
| GET    | `/api/stats`                    | –    | Counts for hero                    |
| GET    | `/api/auth/github` → `/callback`| –    | OAuth flow                         |

## ❓ FAQ

**Can the DB live in GitHub (issues/discussions as storage)?**
Technically yes (like Giscus does) — but it's a trap for a "real" forum: 60 req/hr anonymous / 5k req/hr authenticated rate limits, no real queries/sorting/pagination, every user needs a GitHub account *with repo access patterns*, and search/notifications become hacks. GitHub is for code. We use GitHub for the one thing it's great at — **identity (OAuth)** — and D1 (also free) for data. Best of both worlds.

**Why polling instead of WebSockets for "live"?**
Cloudflare WebSockets need Durable Objects, whose always-on connections burn the free quota fast. Incremental `?after=` polling (4s, tab-aware, tiny payloads) feels instant, costs ~nothing, and scales 10x further on $0. Upgrade path is documented on the roadmap.

**How do I become admin?**
First human to sign in becomes admin automatically. Or set `ADMIN_GITHUB_USERNAME`.

## 🗺 Roadmap

- [ ] 📎 R2 image/file uploads (10 GB free)
- [ ] 🤖 Turnstile captcha on signup/posting (unlimited free)
- [ ] 🔎 FTS5 full-text search (D1 supports it)
- [ ] 📡 Durable Objects WebSocket room per hot thread (optional upgrade)
- [ ] 🏷 Tags, 🗳 polls, ✅ solved-markers for Help category
- [ ] 📧 Email digests via Resend free tier / GitHub notifications
- [ ] 🌗 Light theme + 🌍 i18n

---

Built with ⚡ by the YoriForum crew. PRs welcome!
