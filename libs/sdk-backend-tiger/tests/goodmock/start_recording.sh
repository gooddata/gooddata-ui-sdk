#!/bin/bash

GOODMOCK_HOST=${HOST:-http://localhost:8080}
BACKEND_HOST=${BACKEND_HOST:-https://staging.dev-latest.stg11.panther.intgdc.com}

#
# Sets up the proxy stub on goodmock so that all /api requests are forwarded to
# the real backend (and implicitly recorded for the subsequent snapshot).
#

echo "Waiting for goodmock ($GOODMOCK_HOST) readiness"
curl --retry-connrefused --retry 10 --retry-delay 1 --silent --fail "$GOODMOCK_HOST/__admin/mappings" > /dev/null

echo "Registering proxy stub -> $BACKEND_HOST"
curl -v -X POST -H "Content-Type: application/json" \
    -d "{\"request\":{\"method\":\"ANY\",\"urlPattern\":\"/api/.*\"},\"response\":{\"proxyBaseUrl\":\"$BACKEND_HOST\"}}" \
    "$GOODMOCK_HOST/__admin/mappings"
