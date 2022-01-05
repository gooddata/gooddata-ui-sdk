#!/bin/bash

#
# In order for recordings to be flushed to disk, the current recording session must be stopped. This makes
# the API call.
#

CURRENT_DIR=$(echo $(cd $(dirname $0) && pwd -P))
MAPPINGS_DIR="${CURRENT_DIR}/recordings/mappings"
FILES_DIR="${CURRENT_DIR}/recordings/__files"

#
# Stop recording - this will make Wiremock dump all recorded files into recordings dir
#

curl  -X POST --insecure "https://localhost:8442/__admin/recordings/stop"

#
# Now delete anything that may been captured and is related to authentication.
#

rm -rf ${MAPPINGS_DIR}/*login*
rm -rf ${MAPPINGS_DIR}/*token*
rm -rf ${FILES_DIR}/*login*
rm -rf ${FILES_DIR}/*token*

