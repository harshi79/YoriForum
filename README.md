# ⚡ YoriForum

A **PHCorner-style community forum** built on **real, free, battle-tested software** — Flarum 2.x + a curated extension pack — running on **$0 hosting**. No servers to code, no credit card, no expiry.

> The old from-scratch build lives in [`legacy-custom-build/`](legacy-custom-build/) (kept for reference). The live project is 100% real forum software.

## The $0 stack

| Layer | Software | Cost |
|---|---|---|
| Forum | Flarum 2.x (MIT, open source) + 20+ free extensions | $0 |
| Hosting | InfinityFree (PHP 8.3, MySQL 8, 5 GB, unlimited bandwidth, SSL) | $0, no card |
| Domain | Free subdomain (`yoriforum.infinityfreeapp.com`-style) | $0 |
| Mail | Gmail App Password / Brevo free SMTP | $0 |
| CDN/security (later) | Cloudflare free plan | $0 |

## What you get (the PHCorner feel)

Classic category sections · emoji reactions · upvotes + automatic **member ranks** (Newbie → Legend) · dark mode · file uploads · polls · ✅ solved markers · GitHub/Google login · spam shields (approval queue + StopForumSpam checks) · sitemap/SEO · mod tools (sticky/lock/split/merge/suspend) · member directory · rules/FAQ pages.

## Start here (in order)

1. **[docs/01-infinityfree-setup.md](docs/01-infinityfree-setup.md)** — hosting account, PHP 8.3, MySQL DB, FTP, free SSL (~20 min)
2. **[docs/02-install-flarum.md](docs/02-install-flarum.md)** — build locally with Composer → upload → web installer
3. **[docs/03-phcorner-pack.md](docs/03-phcorner-pack.md)** — enable + configure every extension, sections, ranks, permissions
4. **[docs/04-admin-handbook.md](docs/04-admin-handbook.md)** — backups, updates, spam ops, troubleshooting
5. **[docs/05-going-further.md](docs/05-going-further.md)** — custom domain, Cloudflare, monitoring, VPS migration path

## Repo layout

```
flarum/
  composer.json          the whole forum definition: core + extension pack
  config.php.example     reference config (installer generates the real one)
  scripts/
    install-local.sh     checks PHP/Composer/exts → composer install
    deploy-ftp.sh        FTP-mirror the build to htdocs (no SSH needed)
  docker/                optional local playground (Apache+PHP 8.3 + MariaDB)
docs/                    the 5 guides above — the real manual
content/                 launch content pack: rules, FAQ, welcome thread, ranks, seed posts
assets/                  brand assets: logo + banner
legacy-custom-build/     archived v1 (custom Next.js build, superseded)
```

## Quick local test (own PC, optional)

```bash
./flarum/scripts/install-local.sh   # needs PHP 8.3 + Composer on your PC
cd flarum/docker && cp .env.example .env && docker compose up -d --build
# open http://localhost:8080 → run the web installer (DB host: db, driver: mariadb)
```

---

Built with ⚡ for communities that start at $0 and grow big. PRs welcome!
