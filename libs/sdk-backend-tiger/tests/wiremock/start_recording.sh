#!/bin/bash

CURRENT_DIR=$(echo $(cd $(dirname $0) && pwd -P))
PROXY_CONFIG_FILE="${CURRENT_DIR}/proxy_config.json"
RECORDING_CONFIG_FILE="${CURRENT_DIR}/recording_config.json"

#
# Sets up proxying /api calls and then starts the recording
#

WIREMOCK_HOST=${HOST:-https://localhost:8442}

echo "Trying wiremock ($WIREMOCK_HOST) readiness"
curl --insecure  --retry-connrefused --retry 5 --retry-delay 1 $WIREMOCK_HOST/__admin

echo "Setting up recordings mode"
curl -v -X POST -H "Content-Type: application/json" \
      -d @${PROXY_CONFIG_FILE} \
      --insecure "$HOST/__admin/mappings"

curl -v -X POST -H "Content-Type: application/json" \
      -d @${RECORDING_CONFIG_FILE} \
      --insecure "$HOST/__admin/recordings/start"
