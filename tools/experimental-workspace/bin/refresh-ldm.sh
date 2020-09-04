#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/ldm/full.ts"

$EXPORTER \
  --hostname "staging3.intgdc.com" \
  --project-id "mbuumy476p78ybcceiru61hcyr8i8lo8" \
  --accept-untrusted-ssl \
  --output "${OUTPUT}"
