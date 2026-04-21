#!/bin/bash

CURRENT_DIR=$(echo $(cd $(dirname $0) && pwd -P))
RECORDINGS_DIR="${CURRENT_DIR}/../tests/goodmock/recordings"
MAPPINGS_FILE="${RECORDINGS_DIR}/mappings.json"

rm -f "${MAPPINGS_FILE}"

echo "Cleared recordings at ${MAPPINGS_FILE}"
