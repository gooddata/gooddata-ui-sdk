#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="${ROOTDIR}/src/recordings"

$RECORDER \
  --hostname "secure.gooddata.com" \
  --project-id "avack24l7eynvolkdbe8nnrjbrjguk9j" \
  --recordingDir "${RECORDING_DIR}"
