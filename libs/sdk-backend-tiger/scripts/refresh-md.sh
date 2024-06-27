#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/fixtures/full.ts"
PROJECTID="e52649f53eaf49d09a1588c91dd3bef7"

$EXPORTER \
  --hostname "https://staging.dev-latest.stg11.panther.intgdc.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${PROJECTID}"
