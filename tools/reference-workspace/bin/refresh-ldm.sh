#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/ldm/full.ts"

$EXPORTER \
  --hostname "secure.gooddata.com" \
  --project-id "avack24l7eynvolkdbe8nnrjbrjguk9j" \
  --output "${OUTPUT}"
