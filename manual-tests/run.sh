#!/usr/bin/env bash
# Runs the full manual-tests suite against a local dev server.
#
#   1. Start the dev server (127.0.0.1:5176, matching what every script expects).
#   2. Run every manual-tests/*.mjs script with Node.
#   3. Stop the dev server.
set -uo pipefail

cd "$(dirname "$0")/.."

HOST=127.0.0.1
PORT=5176

setsid npx vite --host "$HOST" --port "$PORT" &
SERVER_PID=$!

cleanup() {
  # `npx` may fork rather than exec into vite, so $SERVER_PID alone is not
  # reliable to kill — signal the whole process group started by setsid.
  kill -- "-$SERVER_PID" 2>/dev/null
  wait "$SERVER_PID" 2>/dev/null
}
trap cleanup EXIT

for i in $(seq 1 50); do
  curl -s -o /dev/null "http://$HOST:$PORT/" && break
  sleep 0.2
done

status=0
for f in manual-tests/*.mjs; do
  echo "=== $f ==="
  if ! node "$f"; then
    status=1
  fi
  echo
done

exit $status
