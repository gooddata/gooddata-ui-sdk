#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="${ROOTDIR}/src/recordings"

$RECORDER \
  --hostname "secure.gooddata.com" \
  --project-id "m2ptzxlets70wm0xy0eim5pf9x42hra8" \
  --recordingDir "${RECORDING_DIR}"
