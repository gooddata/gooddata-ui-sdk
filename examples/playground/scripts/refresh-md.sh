#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/md/full.ts"
WORKSPACEID="auiwj6pa2cs3twpjr98gtjfb34x3i0gv"

$EXPORTER \
  --backend bear \
  --hostname "https://staging3.intgdc.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${WORKSPACEID}"
