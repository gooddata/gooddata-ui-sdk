#!/bin/bash

CURRENT_DIR=$(echo $(cd $(dirname $0) && pwd -P))
PROXY_CONFIG_FILE="${CURRENT_DIR}/proxy_config.json"
RECORDING_CONFIG_FILE="${CURRENT_DIR}/recording_config.json"

#
# Sets up proxying /gdc calls and then starts the recording
#

curl  -X POST -H "Content-Type: application/json" \
      -d @${PROXY_CONFIG_FILE} \
      --insecure "https://localhost:8443/__admin/mappings"

curl  -X POST -H "Content-Type: application/json" \
      -d @${RECORDING_CONFIG_FILE} \
      --insecure "https://localhost:8443/__admin/recordings/start"
