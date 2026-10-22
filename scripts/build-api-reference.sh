#!/usr/bin/env bash
# Generate the API reference from the SDK api model and place it into a content tree.
#
# Usage: build-api-reference.sh <content-dir>
#   content-dir  content/en (working tree) or versioned_docs (release build), relative to sdk/docs
#
# Env:
#   SDK_LIBS_DIR  where <pkg>/temp/<pkg>.api.json live; default sdk/libs
#   OUT_DIR       generator output; default a fresh mktemp dir
#   API_REFERENCE_OPTIONAL  when 1, a missing api model prints the recipe and
#                 exits 0 instead of failing — for local `hugo server` runs,
#                 where the site is built with refLinksErrorLevel = warning
#                 (config/local) so the unresolved reference links only warn.
set -euo pipefail

CONTENT_DIR=${1:?usage: build-api-reference.sh <content-dir>}
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DOCS_DIR=$SCRIPT_DIR/../docs
SDK_LIBS_DIR=${SDK_LIBS_DIR:-$SCRIPT_DIR/../libs}
if [ -z "${OUT_DIR:-}" ]; then
  OUT_DIR=$(mktemp -d)
  trap 'rm -rf "$OUT_DIR"' EXIT
fi
export SDK_LIBS_DIR OUT_DIR

if ! compgen -G "$SDK_LIBS_DIR/*/temp/*.api.json" > /dev/null; then
  cat >&2 <<EOF
[build-api-reference] no api model under $SDK_LIBS_DIR (*/temp/*.api.json).
  Either build the SDK:   cd sdk && node ../common/scripts/install-run-rush.js build --to subspace:sdk && node ../common/scripts/install-run-rush.js api-extractor --to subspace:sdk
  or point SDK_LIBS_DIR at a staged snapshot laid out as <pkg>/temp/<pkg>.api.json
EOF
  if [ "${API_REFERENCE_OPTIONAL:-}" = "1" ]; then
    echo "[build-api-reference] API_REFERENCE_OPTIONAL=1 — skipping; /api-reference/ stays empty and its links will warn" >&2
    exit 0
  fi
  exit 1
fi

echo "[build-api-reference] generating from $SDK_LIBS_DIR into $OUT_DIR"
(cd "$DOCS_DIR" && npm run -s api-reference:generate)
"$SCRIPT_DIR/place-api-reference.sh" "$OUT_DIR" "$DOCS_DIR/$CONTENT_DIR"
