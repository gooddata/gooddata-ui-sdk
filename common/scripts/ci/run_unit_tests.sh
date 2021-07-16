#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
WIREMOCK_DIR="${DIR}/../../../libs/sdk-backend-bear/tests/wiremock"

# Network for the wiremock server(s) & the test code to share; this is exported and propagated to dockerized
# rush runs.
export WIREMOCK_NET="wiremock-sdk-ui-${RANDOM}"

_RUSH="${DIR}/docker_rush.sh"

# ---------------------------------------------------------------------
# Support for starting wiremock on a dedicated docker network
# ---------------------------------------------------------------------


#
# Start wiremock server(s) needed by the integrated tests. This will create a dedicated docker bridge network
# that will be used by the containers.
#
start_wiremocks () {
  WIREMOCK_DIR="${DIR}/../../../libs/sdk-backend-bear/tests/wiremock"
  _WIREMOCK_START="${WIREMOCK_DIR}/start_wiremock.sh"
  _WIREMOCK_STOP="${WIREMOCK_DIR}/stop_wiremock.sh"

  docker network create ${WIREMOCK_NET} || { echo "Network creation failed" && exit 1 ; }

  $_WIREMOCK_START detached
}

#
# Stop wiremock server(s) & destroy the network
#
stop_wiremocks () {
  $_WIREMOCK_STOP

  docker network rm ${WIREMOCK_NET}
}

# ---------------------------------------------------------------------
# The execution of the actual tasks
# ---------------------------------------------------------------------

if ! start_wiremocks ; then
    echo "Failed to start wiremock. Please make sure Docker is installed and up and running. If running, check for port conflicts."

    stop_wiremocks

    exit 1
fi

RC=1

{
  $_RUSH install
  RC=$?

  if [ $RC -eq 0 ]; then
    $_RUSH build
    RC=$?
  fi;

  if [ $RC -eq 0 ]; then
    $_RUSH validate-pr
    RC=$?
  fi;

  if [ $RC -eq 0 ]; then
    $_RUSH test-pr
    RC=$?
  fi

  stop_wiremocks
} || {
  stop_wiremocks
}


exit ${RC}
