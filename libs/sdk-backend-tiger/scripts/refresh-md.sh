#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/fixtures/full.ts"
PROJECTID="2b7da2afb0d34f4397481c4d2a2d50b0"

$EXPORTER \
  --hostname "https://staging.anywhere.gooddata.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${PROJECTID}" \
  --backend "tiger"
