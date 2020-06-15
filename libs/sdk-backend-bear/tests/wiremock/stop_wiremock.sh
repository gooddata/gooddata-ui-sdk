#!/bin/bash

#
# Stops detached wiremock server - if there is any running. This will first stop active recording so that
# Wiremock has chance to flush state to disk.
#

WIREMOCK_DIR=$(echo $(cd $(dirname $0) && pwd -P))
WIREMOCK_FILE="${WIREMOCK_DIR}/.wiremock_containerid"
STOP_RECORDING="${WIREMOCK_DIR}/stop_recording.sh"

if [ -f ${WIREMOCK_FILE} ]; then
  cid=$(cat "${WIREMOCK_FILE}")
  echo "Stopping Wiremock container ${cid}; recordings in progress will be stopped and saved"

  ${STOP_RECORDING}
  docker stop ${cid}
  rm -rf ${WIREMOCK_FILE}
fi
