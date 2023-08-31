#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/fixtures/full.ts"
PROJECTID="00d48e50c5e0442abc2181a7afd0f66b"

$EXPORTER \
  --hostname "https://staging.anywhere.gooddata.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${PROJECTID}" \
  --backend "tiger"
