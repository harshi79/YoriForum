# 05 — Going further (all still free, except the optional domain)

## Custom domain (optional, ~₹800/year when you can)
Free subdomains work fine to start. When ready: buy a domain anywhere → point it to InfinityFree (add as Addon/Parked domain in panel, set nameservers they give you) → re-issue free SSL → update Flarum `config.php` `url` + Admin → Basics. Zero reinstall needed.

## Cloudflare in front (free, recommended)
Even on the free subdomain path, Cloudflare's free plan gives you: CDN caching (faster forum worldwide), auto-SSL, DDoS protection, and "Under Attack" panic mode for spam waves.
1. Sign up at dash.cloudflare.com → Add site → follow DNS import.
2. Use Full (strict) SSL mode once InfinityFree SSL is installed.
3. Turn on "Auto Minify" + caching for `assets/*`.

## Monitoring (free)
- **UptimeRobot** (free tier): pings your forum every 5 min, alerts on Telegram/email when down.
- **Google Search Console** (free): submit `sitemap.xml` (fof/sitemap), watch indexing + search traffic.

## When you outgrow shared hosting
Signs: constant slowness, hitting inode/hit limits, need cron/email/server control.
Migration path (still $0): **Oracle Cloud Always-Free VPS** (2 VMs free forever) → install Apache/Nginx + PHP + MariaDB → move files + DB dump → point DNS. Your Flarum (same version) moves over unchanged; then you get SSH, cron, and real mail. (Oracle signup needs a card for verification — the only step in this whole project that does.)

## Zero-effort alternatives (know they exist)
- **FreeFlarum.com** — free managed Flarum hosting (unofficial, limited extensions). Great for a 5-minute trial of Flarum itself before you commit.
- **ProFreeHost / GoogieHost** — other free PHP hosts if you ever need a mirror.

## Community channels (Telegram + Discord, free)
Both big forums run live chat off-forum — do the same (it's also our shoutbox substitute, since no verified v2 shoutbox fits no-SSH shared hosting):
1. Create a **Telegram group** (free) + a **Discord server** (free): `#announcements` (mirror forum news), `#general`, `#support`, `#share-drops`.
2. Add invite links via **Admin → Links** (nav), Custom Footer, and the welcome thread.
3. Add free mod bots (TG: Rose/Group Butler; Discord: Wick/Carl-bot free tiers) + mirror the forum rules (same rules apply off-site).
4. Use channels for: update blasts, event hype, quick help, downtime comms. Keep real knowledge ON the forum (searchable forever) — chat is for hanging out.

## Contributing to YoriForum
This repo is the deployment kit + docs. PRs welcome for: better rank ladders, tag structures, translations, theme tweaks (share LESS/CSS overrides that survive updates), and new-guide pages.
