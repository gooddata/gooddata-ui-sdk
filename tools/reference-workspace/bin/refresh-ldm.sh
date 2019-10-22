#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/ldm/full.ts"

$EXPORTER \
  --hostname "secure.gooddata.com" \
  --project-id "m2ptzxlets70wm0xy0eim5pf9x42hra8" \
  --output "${OUTPUT}"
