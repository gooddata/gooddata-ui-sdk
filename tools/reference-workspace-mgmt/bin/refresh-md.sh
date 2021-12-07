#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/../reference-workspace/src/md/full.ts"

$EXPORTER \
  --hostname "secure.gooddata.com" \
  --output "${OUTPUT}"
