#!/bin/bash

#
# This script builds and run testcafe tests
#

set -eu
set -o pipefail

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))

_RUSH="${DIR}/docker_rush.sh"
_TESTCAFE="${DIR}/docker_testcafe.sh"

export EXAMPLES_BUILD_TYPE=${EXAMPLES_BUILD_TYPE:-"public"}
export EXAMPLE_MAPBOX_ACCESS_TOKEN=${MAPBOX_TOKEN}

$_RUSH install

#
# Run testcafe
#

export APP_HOST=${APP_HOST}
export IMAGE_ID=${IMAGE_ID:-"testcafe/testcafe:latest"}

$_TESTCAFE
