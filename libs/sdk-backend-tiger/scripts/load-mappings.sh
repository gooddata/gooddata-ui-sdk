#!/bin/bash
set -e

ROOT_DIR=$(cd $(dirname $0)/.. && pwd -P)
MAPPINGS_FILE="${ROOT_DIR}/tests/goodmock/recordings/mappings.json"
GOODMOCK_HOST=${HOST:-http://localhost:8080}

echo "Waiting for goodmock ($GOODMOCK_HOST) readiness"
curl --retry-connrefused --retry 10 --retry-delay 1 --silent --fail "$GOODMOCK_HOST/__admin/mappings" > /dev/null

if [ ! -f "$MAPPINGS_FILE" ]; then
    echo "No mappings file found at $MAPPINGS_FILE, skipping import"
    exit 0
fi

echo "Importing mappings from $MAPPINGS_FILE"
curl --silent --fail -X POST -H "Content-Type: application/json" \
    --data @"$MAPPINGS_FILE" \
    "$GOODMOCK_HOST/__admin/mappings/import" > /dev/null
echo "Mappings imported"
