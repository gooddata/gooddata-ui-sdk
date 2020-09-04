#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="${ROOTDIR}/src/recordings"

$RECORDER \
  --hostname "developer.na.gooddata.com" \
  --project-id "xms7ga4tf3g3nzucd8380o2bev8oeknp" \
  --recordingDir "${RECORDING_DIR}"
