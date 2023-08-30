#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/fixtures/full.ts"
PROJECTID="e3e18522144e43ecababf336cf64aab1"

$EXPORTER \
  --hostname "https://staging.anywhere.gooddata.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${PROJECTID}" \
  --backend "tiger"
