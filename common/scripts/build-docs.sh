#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR="${DIR}/../.."

API_DOCUMENTER_BIN="${ROOT_DIR}/common/temp/node_modules/@microsoft/api-documenter/bin/api-documenter"
APIDOC_DIR="${ROOT_DIR}/apidocs"
APIDOC_INPUT_DIR="${APIDOC_DIR}/input"
APIDOC_OUTPUT_DIR="${APIDOC_DIR}/markdown"

BUILD_OUT="${APIDOC_DIR}/build-docs.log"
BUILD_ERR="${APIDOC_DIR}/build-docs.err"

rm -rf "${APIDOC_DIR}"
mkdir -p "${APIDOC_INPUT_DIR}"

cp ${ROOT_DIR}/libs/*/temp/*.api.json "${APIDOC_INPUT_DIR}"

echo "Starting api-documenter. Generated files will be stored in apidocs/markdown. Generator outputs routed to apidocs/build-docs.log and apidocs/build-docs.err."

"${API_DOCUMENTER_BIN}" markdown --input-folder "${APIDOC_INPUT_DIR}" --output-folder ${APIDOC_OUTPUT_DIR} 1>"${BUILD_OUT}" 2>"${BUILD_ERR}"
