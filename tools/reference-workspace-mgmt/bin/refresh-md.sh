#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/../reference-workspace/src/md/full.ts"

$EXPORTER \
  --backend tiger \
  --hostname "https://staging-automation.dev-latest.stg11.panther.intgdc.com" \
  --workspace-id "e2aeb364793b443582720834df254b0d" \
  --catalog-output "${OUTPUT}"
