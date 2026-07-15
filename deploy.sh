#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/opt/eatsee-landing"
WWW_DIR="/var/www/eatsee.pl"

cd "$REPO_DIR"
git pull --ff-only
rsync -a --delete \
  --exclude '.git' \
  --exclude 'deploy.sh' \
  --exclude '.gitignore' \
  "$REPO_DIR/" "$WWW_DIR/"

echo "Wdrozono: $(git rev-parse --short HEAD) -> $WWW_DIR"
