#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

source "${ROOTDIR}/.env"

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="${ROOTDIR}/../reference-workspace/src/recordings"

if [ -z "$TIGER_API_TOKEN" ] || [ -z "$HOST_NAME" ] || [ -z "$WORKSPACE_ID" ]; then
    echo "Error: TIGER_API_TOKEN, HOST_NAME, and WORKSPACE_ID must be set in reference-workspace-mgmt/.env file"
    exit 1
fi

$RECORDER \
  --hostname ${HOST_NAME} \
  --project-id ${WORKSPACE_ID} \
  --replace-project-id "referenceworkspace" \
  --tigerToken "${TIGER_API_TOKEN}" \
  --recordingDir "${RECORDING_DIR}"
