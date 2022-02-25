#!/bin/bash
SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="./recordings"

$RECORDER \
  --hostname "secure.gooddata.com" \
  --project-id "l32xdyl4bjuzgf9kkqr2avl55gtuyjwf" \
  --replace-project-id "reference-workspace" \
  --recordingDir "${RECORDING_DIR}"
