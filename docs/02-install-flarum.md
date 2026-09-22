# 02 — Install Flarum on InfinityFree

Two paths. **Path A is recommended** — it installs the full YoriForum (PHCorner-style) extension pack in one go.

## Path A — Full pack: local Composer build + FTP upload (recommended)

### A1. Install PHP 8.3 + Composer on your own computer

- **PHP 8.3+**: Windows → XAMPP (php 8.3 build) or Laragon (easiest); macOS → `brew install php@8.3`; Linux → distro packages.
  Enable extensions: `curl dom fileinfo gd mbstring openssl pdo_mysql tokenizer zip` (XAMPP/Laragon ship them — just uncomment in `php.ini` if needed).
- **Composer**: https://getcomposer.org/download (Windows: `Composer-Setup.exe`).
- Verify: `php -v` shows 8.3+, `composer --version` works.

### A2. Build YoriForum

```bash
git clone https://github.com/harshi79/YoriForum.git
cd YoriForum
./flarum/scripts/install-local.sh
```

This runs `composer install` on `flarum/composer.json` (Flarum 2.x core + Extension Manager + the whole PHCorner pack). Takes a few minutes.

> If Composer complains that ONE extension has no Flarum-2.x-compatible release yet: delete that line from `flarum/composer.json`, re-run, and install it later from the in-admin Extension Manager once released. Don't let one extension block you.

### A3. Convert to no-public-dir layout (shared-hosting requirement)

InfinityFree always serves `htdocs/` and you can't point it at `public/`. Flarum officially supports this — do the conversion **locally before uploading** (per the [official docs](https://docs.flarum.org/install/)):

1. In your local `flarum/` build folder, **move everything inside `public/` up one level** into `flarum/` itself (including the hidden `.htaccess`). Then delete the now-empty `public/` folder.
2. Edit the moved `.htaccess`: **uncomment lines 9–15** (the block that protects sensitive files — it says so in the comments).
3. Edit `site.php`, set the paths to:
   ```php
   'base' => __DIR__,
   'public' => __DIR__,
   'storage' => __DIR__.'/storage',
   ```
4. That's it. Your `flarum/` folder is now upload-ready: `index.php`, `.htaccess`, `site.php`, `vendor/`, `storage/`, `extend.php`, etc. all at top level.

### A4. Upload via FTP

- **Easy way (FileZilla)**: connect with FTP creds from doc 01 → drag the **contents** of local `flarum/` into remote `htdocs/`. Skip any `scripts/`, `docker/`, `composer.json` (harmless if uploaded, but not needed on the server). First upload is big (~50–100 MB with `vendor/`) — let it finish.
- **Script way**: `FTP_HOST=… FTP_USER=… FTP_PASS=… ./flarum/scripts/deploy-ftp.sh` (needs `lftp`; set `DRYRUN=1` first to preview).

### A5. Run the web installer

1. Open `https://your-subdomain.infinityfreeapp.com` → the Flarum installer appears.
2. Fill in: forum title, admin username/email/password, DB driver (`mysql` or `mariadb` — must match doc 01 step 3!), DB host/name/user/pass.
3. If it complains about writable paths: in FileZilla, right-click remote `storage/`, `assets/`(created after install — actually set on `storage/` + forum root) → File permissions → **775** (and "recurse into subdirectories"). The docs explicitly say never use 777.
4. Finish → log in as admin → go to **Admin → Extensions** and **enable** the pack (start with Tags, then the rest per doc 03).

### A6. Install future extensions without SSH

You already have `flarum/extension-manager` — most day-to-day installs/updates can be done from **Admin → Extensions Manager** in the browser. If it ever needs CLI-only steps, redo Path A locally and re-upload (re-uploads are incremental — only changed files).

---

## Path B — Quick core-only start (official archive, no Composer)

1. Download the **no-public-dir ZIP for PHP 8.3** from the [official installation packages](https://github.com/flarum/installation-packages/tree/main/packages/v2.x) (Public Path = No).
2. Upload the ZIP via Control Panel → File Manager into `htdocs/` → extract there.
3. Run the web installer (same as A5).
4. ⚠️ You get core Flarum only. To add the extension pack later you must redo **Path A** (there's no Composer on the host). Honestly: just start with Path A.

---

## After install — the 10-minute checklist

- [ ] Admin → Basics: title, description, welcome banner
- [ ] Admin → Mail: set external SMTP (Gmail App Password / Brevo free) — InfinityFree's PHP mail is unreliable
- [ ] Admin → Extensions: enable pack in doc-03 order
- [ ] Create tags/sections (doc 03) + welcome discussion
- [ ] Admin → Permissions: guests read-only, first post needs approval (doc 03)
- [ ] Force HTTPS (doc 01 step 5) + test login/logout/register flow

## Troubleshooting

| Symptom | Cause → fix |
|---|---|
| Blank page / 500 error | Permissions → chmod 775 (recurse) on `storage/`; check `storage/logs/` via FTP |
| CSS/JS broken, only text | `.htaccess` missing in `htdocs/` (hidden file — enable "show hidden" in FileZilla) or mod_rewrite off |
| Installer: DB connection failed | Wrong host (must be `sql123…`, not localhost) or wrong driver (`mysql` vs `mariadb`) |
| "Line 9–15" confusion | That's inside the `.htaccess` you moved up — uncomment the protection block |
| Upload fails / timeouts | FTP in chunks (FileZilla queue), or upload a ZIP via File Manager and extract there |

Next → **[03-phcorner-pack.md](03-phcorner-pack.md)**
