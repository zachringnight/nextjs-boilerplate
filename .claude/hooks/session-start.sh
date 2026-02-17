#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install npm dependencies
npm install

# Start the Next.js dev server on port 3000 in the background
if ! lsof -i :3000 >/dev/null 2>&1; then
  nohup npm run dev -- -p 3000 > /tmp/nextjs-dev.log 2>&1 &
fi
