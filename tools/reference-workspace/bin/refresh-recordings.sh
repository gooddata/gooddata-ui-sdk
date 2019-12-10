#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="${ROOTDIR}/src/recordings"

$RECORDER \
  --hostname "secure.gooddata.com" \
  --project-id "l32xdyl4bjuzgf9kkqr2avl55gtuyjwf" \
  --recordingDir "${RECORDING_DIR}"
