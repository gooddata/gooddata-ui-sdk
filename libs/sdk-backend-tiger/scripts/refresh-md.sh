#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/fixtures/full.ts"
PROJECTID="b51b89a10e5845189a6fea8e96dba226"

$EXPORTER \
  --hostname "https://staging.anywhere.gooddata.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${PROJECTID}" \
  --backend "tiger"
