#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."

EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/ldm/full.ts"

$EXPORTER \
  --hostname "secure.gooddata.com" \
  --project-id "l32xdyl4bjuzgf9kkqr2avl55gtuyjwf" \
  --output "${OUTPUT}"
