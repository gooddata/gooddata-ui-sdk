#!/bin/bash

#
# This script prepares the repository to be audited by SonarQube
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))

ROOT_DIR="${DIR}/../../..";

node "${DIR}/../install-run-rush.js" install

# remove files that break SonarQube for some reason
rm -f "${ROOT_DIR}/examples/sdk-examples/Procfile"