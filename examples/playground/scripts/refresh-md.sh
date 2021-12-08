#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/md/full.ts"
PROJECTID="xms7ga4tf3g3nzucd8380o2bev8oeknp"

$EXPORTER \
  --hostname "https://developer.na.gooddata.com" \
  --output "${OUTPUT}" \
  --project-id "${PROJECTID}"