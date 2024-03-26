#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

source "${ROOTDIR}/.env"

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="${ROOTDIR}/../reference-workspace/src/recordings"

$RECORDER \
  --hostname "https://staging-automation.dev-latest.stg11.panther.intgdc.com" \
  --backend "tiger" \
  --project-id "e2aeb364793b443582720834df254b0d" \
  --replace-project-id "referenceworkspace" \
  --tigerToken "${TIGER_API_TOKEN}" \
  --recordingDir "${RECORDING_DIR}"
