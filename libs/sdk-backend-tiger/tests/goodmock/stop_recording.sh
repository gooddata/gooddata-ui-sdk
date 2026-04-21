#!/bin/bash
set -e

CURRENT_DIR=$(cd $(dirname $0) && pwd -P)
RECORDINGS_DIR="${CURRENT_DIR}/recordings"
MAPPINGS_FILE="${RECORDINGS_DIR}/mappings.json"
GOODMOCK_HOST=${HOST:-http://localhost:8080}

#
# Snapshot the recorded interactions from goodmock into a single mappings.json
# file and strip any sensitive data before committing.
#

mkdir -p "${RECORDINGS_DIR}"

node "${CURRENT_DIR}/snapshot-and-sanitize.mjs" "$GOODMOCK_HOST" "$MAPPINGS_FILE"
