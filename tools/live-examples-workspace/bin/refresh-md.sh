#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/md/full.ts"

$EXPORTER \
  --hostname "developer.na.gooddata.com" \
  --project-id "xms7ga4tf3g3nzucd8380o2bev8oeknp" \
  --output "${OUTPUT}"
