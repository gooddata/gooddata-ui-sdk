#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

RECORDER="${ROOTDIR}/node_modules/.bin/gdc-mock-handling"
RECORDING_DIR="${ROOTDIR}/src/recordings"

$RECORDER \
  --hostname "staging3.intgdc.com" \
  --project-id "d79dpgty2b4ydewi6kbzqm4fq1be2ltm" \
  --accept-untrusted-ssl \
  --recordingDir "${RECORDING_DIR}"
