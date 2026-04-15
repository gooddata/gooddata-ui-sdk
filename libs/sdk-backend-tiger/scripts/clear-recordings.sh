#!/bin/bash

CURRENT_DIR=$(echo $(cd $(dirname $0) && pwd -P))
RECORDINGS_DIR="${CURRENT_DIR}/../tests/wiremock/recordings"
MAPPINGS_DIR="${RECORDINGS_DIR}/mappings"
FILES_DIR="${RECORDINGS_DIR}/__files"

rm -rf ${MAPPINGS_DIR}/* ${FILES_DIR}/*

echo "Cleared recordings in ${MAPPINGS_DIR} and ${FILES_DIR}"
