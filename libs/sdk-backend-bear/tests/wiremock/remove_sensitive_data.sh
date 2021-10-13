#!/bin/bash

CURRENT_DIR=$(echo $(cd $(dirname $0) && pwd -P))
ROOT_DIR="${CURRENT_DIR}/../.."
MAPPINGS_DIR="${CURRENT_DIR}/recordings/mappings"

#
# Script that removes sensitive data from recordings
#
node ${ROOT_DIR}/scripts/remove-sensitive-data.js $MAPPINGS_DIR