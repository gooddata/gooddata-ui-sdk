#!/bin/bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXPORTER="${ROOTDIR}/node_modules/.bin/gdc-catalog-export"
OUTPUT="${ROOTDIR}/src/fixtures/full.ts"
# todo create a reference workspace for tiger wiremock tests with GoodSales fixtures
PROJECTID="4dc4e033e611421791adea58d34d958c"

$EXPORTER \
  --hostname "https://staging.anywhere.gooddata.com" \
  --output "${OUTPUT}" \
  --project-id "${PROJECTID}" \
  --backend "tiger"
