#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/md/full.ts"
WORKSPACEID="xms7ga4tf3g3nzucd8380o2bev8oeknp"

$EXPORTER \
  --backend bear \
  --hostname "https://developer.na.gooddata.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${WORKSPACEID}"
