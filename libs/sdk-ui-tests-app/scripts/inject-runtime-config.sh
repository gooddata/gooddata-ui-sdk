#!/usr/bin/env bash
# (C) 2026 GoodData Corporation
#
# Generates dist/config.js with runtime configuration for the built app.
# Must be called after "npm run dist" and before "npm run pack-build".
#
# Usage: ./scripts/inject-runtime-config.sh <WORKSPACE_ID>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/../dist"

WORKSPACE_ID="${1:?Usage: inject-runtime-config.sh <WORKSPACE_ID>}"

cat > "$DIST_DIR/config.js" <<EOF
// Runtime configuration injected by inject-runtime-config.sh
window.WORKSPACE_ID = "${WORKSPACE_ID}";
EOF

echo "Wrote $DIST_DIR/config.js with WORKSPACE_ID=${WORKSPACE_ID}"
