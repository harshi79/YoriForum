# 01 — InfinityFree hosting setup (~20 min, $0)

InfinityFree: free-forever hosting, no credit card, PHP 8.3, MySQL 8 / MariaDB 11, 5 GB disk, unlimited bandwidth, free SSL + free subdomain. Exactly what Flarum 2.x needs (PHP 8.3+, MySQL 8.0.30+/MariaDB 10.3+).

## Step 1 — Create your account

1. Go to **infinityfree.com** → Sign up with just your email (no card, not a trial).
2. Open the **Client Area** → **Create Account** (hosting account).
3. Choose a **free subdomain**, e.g. `yoriforum.infinityfreeapp.com` (pick whatever they offer — it's $0 and you can add a custom domain later).
4. Wait a few minutes for the account to activate. Open it → **Control Panel**.

> Your website files live in **`htdocs/`**. The domain always points there — you can't change it, which is why we use Flarum's no-public-dir layout (handled in doc 02).

## Step 2 — Set PHP 8.3

1. Control Panel → **Select PHP Version** (sometimes under "Software").
2. Choose **PHP 8.3** (Flarum 2.x minimum) and save.
3. Leave extensions at defaults — InfinityFree ships the ones Flarum needs (curl, gd, mbstring, pdo_mysql, …).

## Step 3 — Create the MySQL database

1. Control Panel → **MySQL Databases** → create one, e.g. name `forum`.
2. **Write these down** (you'll need them in the Flarum installer):
   - **MySQL Host** — looks like `sql123.infinityfree.com` ⚠️ **NOT `localhost`**
   - **Database name** — looks like `if0_12345678_forum`
   - **Username** — looks like `if0_12345678`
   - **Password** — your hosting account password
   - **Driver** — check whether the panel says **MySQL 8** or **MariaDB** (Flarum 2.x treats them as different drivers)

## Step 4 — Get your FTP credentials

1. Control Panel → **FTP Accounts** (or find "FTP Details" in the Client Area).
2. Note **FTP hostname** (often `ftpupload.net`), **username**, **password**.
3. You'll upload with FileZilla (easy, visual) or the repo's `deploy-ftp.sh` script (needs `lftp`).

## Step 5 — Free SSL (https://)

1. Client Area → **Free SSL Certificates** → request one for your subdomain → follow the validation steps shown (usually automatic/CNAME).
2. Once issued, **install it** via the panel's SSL section.
3. After Flarum is installed, force HTTPS by adding this to the TOP of the `.htaccess` in `htdocs/`:

```apache
RewriteEngine On
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

> Don't skip this — browsers + Google punish non-HTTPS forums, and logins over HTTP are unsafe.

## Known free-plan limits (plan around them)

| Limit | Impact | Workaround (all in this repo) |
|---|---|---|
| **No SSH / no Composer** | Can't install Flarum/updates on the server | Build locally with Composer → upload via FTP (doc 02, Path A) |
| **No cron jobs** | Flarum's scheduler (mail queue, cleanup) won't auto-run | Forum works fine without it; use external SMTP; revisit on a VPS later |
| **No/outbound email restricted** | PHP `mail()` unreliable | External SMTP in Admin → Email (Gmail App Password or Brevo free tier) |
| **Fair-use hits/inodes** | Fine for a new forum | 5 GB disk is plenty; keep uploads ≤ a few MB each (doc 03) |
| **Fixed `htdocs` webroot** | Flarum normally wants `public/` as webroot | Official no-public-dir layout (doc 02) |

Next → **[02-install-flarum.md](02-install-flarum.md)**
