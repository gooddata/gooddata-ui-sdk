#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/md/full.ts"
WORKSPACEID="4dc4e033e611421791adea58d34d958cz"

$EXPORTER \
  --hostname "https://staging.dev-latest.stg11.panther.intgdc.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${WORKSPACEID}"
