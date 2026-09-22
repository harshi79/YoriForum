#!/usr/bin/env bash
# YoriForum — build Flarum + extension pack on your own computer.
# Run from the repo root:  ./flarum/scripts/install-local.sh
# Then upload the result to InfinityFree (see docs/02-install-flarum.md).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Checking PHP..."
if ! command -v php >/dev/null; then
  echo "ERROR: PHP not found. Install PHP 8.3+ first: https://www.php.net/downloads"
  echo "  Windows: https://windows.php.net/download (Thread Safe ZIP) or use XAMPP/Laragon"
  exit 1
fi
php -v | head -1
php -r 'exit(version_compare(PHP_VERSION, "8.3.0", ">=") ? 0 : 1);' \
  || { echo "ERROR: Flarum 2.x needs PHP 8.3+"; exit 1; }

echo "==> Checking PHP extensions..."
missing=""
for ext in curl dom fileinfo gd mbstring openssl pdo_mysql tokenizer zip; do
  php -m | grep -qi "^$ext$" || missing="$missing $ext"
done
if [ -n "$missing" ]; then
  echo "ERROR: missing PHP extensions:$missing"
  echo "Enable them in php.ini (uncomment extension=... lines) and re-run."
  exit 1
fi
echo "All required extensions present."

echo "==> Checking Composer..."
if ! command -v composer >/dev/null; then
  echo "ERROR: Composer not found. Install it: https://getcomposer.org/download"
  echo "  Windows: use the Composer-Setup.exe installer."
  exit 1
fi

echo "==> Installing Flarum + YoriForum pack (this takes a few minutes)..."
composer install --no-dev --prefer-dist --optimize-autoloader

echo ""
echo "BUILD DONE ✅  Files are in: $(pwd)"
echo "If ANY package failed (no Flarum-2.x release yet), remove that line"
echo "from flarum/composer.json, re-run, and install it later via the"
echo "in-admin Extension Manager once a compatible release exists."
echo ""
echo "Next: docs/02-install-flarum.md → 'Path A' (no-public-dir layout + FTP upload)."
