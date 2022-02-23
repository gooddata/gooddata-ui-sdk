#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/scenarios/src/md/full.ts"
PROJECTID="frho3i7qc6epdek7mcgergm9vtm6o5ty"

echo "This is stdout"

$EXPORTER \
  --hostname "https://staging3.intgdc.com" \
  --accept-untrusted-ssl \
  --output "${OUTPUT}" \
  --project-id "${PROJECTID}"