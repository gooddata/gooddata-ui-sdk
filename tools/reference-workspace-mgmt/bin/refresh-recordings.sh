#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="${ROOTDIR}/../reference-workspace/src/recordings"

$RECORDER \
  --hostname "secure.gooddata.com" \
  --recordingDir "${RECORDING_DIR}"
