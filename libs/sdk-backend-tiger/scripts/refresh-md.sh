#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/fixtures/full.ts"
PROJECTID="ef5b548074ed4e9cbbb267caea8a9926"

$EXPORTER \
  --hostname "https://staging.dev-latest.stg11.panther.intgdc.com" \
  --catalog-output "${OUTPUT}" \
  --workspace-id "${PROJECTID}"
