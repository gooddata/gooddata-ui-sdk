#!/bin/bash

#
# This script orchestrates the apidocs build
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

source ${DIR}/utils.sh

if [ -z $API_DOCS_VERSION ]; then
  echo "You did not specify api docs version to create."
  exit 1
fi

# first build the SDK to make sure the api files are up to date
${_RUSH} install
${_RUSH} build

# then run the build script for the api docs
${DIR}/docker_apidocs_build.sh
