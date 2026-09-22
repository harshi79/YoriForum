# 04 — Admin handbook: run it like a pro (still $0)

## Weekly routine (15 min)
- [ ] Clear the **Flags** queue + approval queue (skim, don't obsess).
- [ ] Check **Admin → Dashboard** for extension updates.
- [ ] Backup (below) — weekly, plus before ANY change.

## Backups (non-negotiable)
InfinityFree free has no automatic backups. You are the backup system:
1. **Database**: Control Panel → phpMyAdmin → select your DB → **Export** (Quick, SQL) → save as `yoriforum-YYYY-MM-DD.sql`. This is 99% of your forum.
2. **Files**: FTP-download `public/assets/` (avatars, uploads, logos) — in no-public-dir layout this is `htdocs/assets/`. Monthly is fine (it only grows).
3. Keep the last 4 weekly SQL dumps on your PC + one copy on Google Drive.

## Updates (core + extensions)
You can't run Composer on the host, so updates happen locally:
1. Backup first (above).
2. On your PC: `cd flarum && composer update` → test in Docker playground if you can.
3. Re-run the no-public-dir conversion ONLY if `public/` reappeared (Composer updates can restore it — check!).
4. Re-upload via FTP/FileZilla (overwrite). Only changed files transfer if your client skips identical ones.
5. Visit Admin → Extensions; clear cache if anything looks stale (Extension Manager has cache tools; or delete `storage/cache/*` via FTP — never delete the folder itself).
6. Smoke-test: home, a thread, login, new post.

## Users & spam ops
- **First-post approval** (set in doc 03) + **fof/anti-spam** catch 95% of bots.
- Spam wave? Temporarily set Tags → post permission off for new Members, clean up with Merge/Split/Delete, ban + Suspend the accounts.
- Trolls: Warn → Suspend (flarum/suspend) → Ban. Document reasons in a private staff tag.
- Only grant **Admin to people you'd give server passwords to** — especially with Extension Manager installed (it can install any Composer package).

## Email
- Use external SMTP (Admin → Email): Gmail App Password (free, ~500 mails/day) or Brevo (free 300/day). Test with "send test mail".
- No cron on InfinityFree = queued mail/notifications may be delayed or skipped. Core notifications in-app still work. Accept it until a VPS move.

## SSL renewal
Free SSL certs expire (~90 days). Client Area → Free SSL Certificates shows expiry — renew a week early and re-install via the panel. Set a phone reminder. (Moving behind Cloudflare later makes this automatic — doc 05.)

## Troubleshooting quick table
| Symptom | Check |
|---|---|
| White screen after enabling extension | Disable via… you can't CLI — restore last backup, then enable extensions one-by-one locally first |
| `storage/logs/` has answers | Download `storage/logs/flarum-*.log` via FTP and read the last error |
| Can't login as admin | Reset via phpMyAdmin is painful — instead keep a second admin account as spare |
| Forum slow | Enable Cloudflare (doc 05), reduce frontpage widgets, keep uploads small |
| "Out of inodes/disk" | 5 GB is huge for text — culprit is uploads; prune `assets/`, lower upload limits |

Next → **[05-going-further.md](05-going-further.md)**
