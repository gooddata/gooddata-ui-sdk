#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/md/full.ts"
WORKSPACEID="heo9nbbna28ol3jnai0ut79tjer5cqdn"

$EXPORTER \
  --backend bear \
  --hostname "https://staging3.intgdc.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${WORKSPACEID}"
