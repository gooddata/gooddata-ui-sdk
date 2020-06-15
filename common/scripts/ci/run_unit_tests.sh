#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

$_RUSH install
$_RUSH build
$_RUSH validate-ci

#
# The tests run in docker, however beware, some of the projects need to start containers on their own. Such as
# the sdk-backend-bear which requires dockerized wiremock to run integrated tests. In our current setup, it is
# not possible to start sibling containers from the container that runs all the tests.
#
# To cater for this, necessary containers are started before the test run instead.
#
# The proper solution is to bind-mount the docker socket into the container, include docker binary in the image
# and let the libs start sibling containers as needed.
#

WIREMOCK_DIR="${DIR}/../../../libs/sdk-backend-bear/tests/wiremock"
_WIREMOCK_START="${WIREMOCK_DIR}/start_wiremock.sh"
_WIREMOCK_STOP="${WIREMOCK_DIR}/stop_wiremock.sh"

$_WIREMOCK_START detached
WIREMOCK_RC=$?

if [ $WIREMOCK_RC -ne 0 ]; then
  echo "Failed to start wiremock. Please make sure Docker is installed and up and running. If running, check for port conflicts."
  exit 1
fi

#
# Explicitly limiting parallelism during tests; this is because Jest already does parallel test execution on
# per-project basis.
#
$_RUSH test-ci --parallelism 4
RC=$?

$_WIREMOCK_STOP

exit ${RC}