#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

source "${ROOTDIR}/.env"

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/../reference-workspace/src/md/full.ts"

if [ -z "$TIGER_API_TOKEN" ] || [ -z "$HOST_NAME" ] || [ -z "$WORKSPACE_ID" ]; then
    echo "Error: TIGER_API_TOKEN, HOST_NAME, and WORKSPACE_ID must be set in reference-workspace-mgmt/.env file"
    exit 1
fi

export TIGER_API_TOKEN=${TIGER_API_TOKEN} && $EXPORTER \
  --hostname  ${HOST_NAME} \
  --workspace-id ${WORKSPACE_ID} \
  --catalog-output "${OUTPUT}"
