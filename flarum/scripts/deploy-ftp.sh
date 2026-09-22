#!/usr/bin/env bash
# YoriForum — upload the local Flarum build to InfinityFree via FTP.
# InfinityFree has no SSH, so FTP mirror is the way.
#
#   1. Build first:  ./flarum/scripts/install-local.sh
#   2. Convert to no-public-dir layout (docs/02-install-flarum.md, Path A step 3)
#   3. Run:
#        FTP_HOST=ftpupload.net FTP_USER=if0_12345678 FTP_PASS='secret' \
#          ./flarum/scripts/deploy-ftp.sh
#
# Needs `lftp` installed. No --delete flag on purpose: never wipes
# server-side uploads (public/assets, avatars) that don't exist locally.
set -euo pipefail

: "${FTP_HOST:?Set FTP_HOST (FTP hostname from hosting panel)}"
: "${FTP_USER:?Set FTP_USER (FTP username from hosting panel)}"
: "${FTP_PASS:?Set FTP_PASS (FTP/hosting password)}"
REMOTE_DIR="${REMOTE_DIR:-htdocs}"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v lftp >/dev/null; then
  echo "ERROR: lftp not found. Install it (apt/brew/choco) or upload with FileZilla instead."
  echo "FileZilla manual steps are in docs/02-install-flarum.md."
  exit 1
fi

if [ ! -f "$LOCAL_DIR/composer.json" ] || [ ! -d "$LOCAL_DIR/vendor" ]; then
  echo "ERROR: $LOCAL_DIR doesn't look like a built Flarum (missing vendor/)."
  echo "Run ./flarum/scripts/install-local.sh first."
  exit 1
fi

echo "==> Mirroring $LOCAL_DIR  →  $FTP_HOST/$REMOTE_DIR"
echo "    (dry run? set DRYRUN=1 to preview without uploading)"
DRY=""
[ "${DRYRUN:-0}" = "1" ] && DRY="--dry-run"

# shellcheck disable=SC2086
lftp -c "
  set ftp:ssl-allow no;
  open -u '$FTP_USER','$FTP_PASS' '$FTP_HOST';
  mirror --reverse --verbose $DRY \
    --exclude-glob .git/ \
    --exclude-glob .github/ \
    --exclude-glob node_modules/ \
    '$LOCAL_DIR/' '$REMOTE_DIR/';
"
echo "UPLOAD DONE ✅  Now open your forum URL to run the web installer (first time only)."
