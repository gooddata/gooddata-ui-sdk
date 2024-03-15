#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/fixtures/full.ts"
PROJECTID="f15bcbc5bcd04b8b8093c70a1a479c35"

$EXPORTER \
  --hostname "https://staging.dev-latest.stg11.panther.intgdc.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${PROJECTID}" \
  --backend "tiger"
