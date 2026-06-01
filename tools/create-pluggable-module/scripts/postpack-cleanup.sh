#!/usr/bin/env bash
# (C) 2026 GoodData Corporation
#
# Removes the temporary dist/templates/ directory that prepack-bundle-template.sh
# created. Keeps the workspace clean for the next rush build.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"

rm -rf "$PACKAGE_DIR/dist/templates"
echo "[postpack] cleaned up dist/templates/"
