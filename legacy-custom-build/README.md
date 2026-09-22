# 🗄 legacy-custom-build

This was **YoriForum v1**: a from-scratch forum built with Next.js 16 + Cloudflare Workers + D1 + GitHub OAuth.

It worked (live threads, notifications, likes, search, rate limits — all tested), but the project direction changed: **YoriForum is now built on real, battle-tested forum software (Flarum)** instead of custom code, to get a full PHCorner-style community with a decade of hardening behind it.

Kept here for reference. The live project is documented in the repo-root `README.md`.

To run this legacy app (needs Node 18+):

```bash
cd legacy-custom-build
npm install
npm run dev   # local D1 via Miniflare, opens on :3000
```
