#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
WIREMOCK_DIR="${DIR}/../../../libs/sdk-backend-bear/tests/wiremock"

# Network for the wiremock server(s) & the test code to share; this is exported and propagated to dockerized
# rush runs.
export WIREMOCK_NET="wiremock-sdk-ui-${RANDOM}"

_RUSH="${DIR}/docker_rush.sh"

# ---------------------------------------------------------------------
# START: testing mechanisms for incremental tests
# ---------------------------------------------------------------------

echo 'Evaluating possible incremental test/validation optimizations'

# get all prefixes only two levels deep to determine which packages were changed
TARGET_BRANCH=$ZUUL_BRANCH
PREFIXES=$(git diff --name-only "$TARGET_BRANCH...HEAD" | awk -F'[ /]' '{ printf "%s/%s\n",$1,$2 }' | sort | uniq)

# if there are any changes outside examples, libs, and tools, we must re-test everything as these often mean
# configuration changes that can affect anything
OUTSIDE_FILES_COUNT=$(echo "$PREFIXES" | grep -Evc '^(examples|libs|tools)')

if [ "$OUTSIDE_FILES_COUNT" -eq 0 ]; then
  echo 'Changes are only in code files, we can make the testing smarter'
  # create an --impacted-by clause for every changed package
  RUSH_SPECS=$(echo "$PREFIXES" | awk -F'[ /]' '{ printf " --impacted-by %s",$2 }')
  echo 'The rush commands would be limited by the following limiters:'
  echo "$RUSH_SPECS"
else
  echo 'There are some files modified outside of the code, falling back to testing everything...'
  RUSH_SPECS=''
fi

# TODO pass $RUSH_SPECS to validate-ci and test-ci like $_RUSH validate-ci $RUSH_SPECS
# always install and build everything, just in case
# once we are confident this works well

# ---------------------------------------------------------------------
# END: testing mechanisms for incremental tests
# ---------------------------------------------------------------------

# ---------------------------------------------------------------------
# Support for starting wiremock on a dedicated docker network
# ---------------------------------------------------------------------

#
# Start wiremock server(s) needed by the integrated tests. This will create a dedicated docker bridge network
# that will be used by the containers.
#
start_wiremocks() {
  WIREMOCK_DIR="${DIR}/../../../libs/sdk-backend-bear/tests/wiremock"
  _WIREMOCK_START="${WIREMOCK_DIR}/start_wiremock.sh"
  _WIREMOCK_STOP="${WIREMOCK_DIR}/stop_wiremock.sh"

  TIGER_WIREMOCK_DIR="${DIR}/../../../libs/sdk-backend-tiger/tests/wiremock"
  _TIGER_WIREMOCK_START="${TIGER_WIREMOCK_DIR}/start_wiremock.sh"
  _TIGER_WIREMOCK_STOP="${TIGER_WIREMOCK_DIR}/stop_wiremock.sh"

  docker network create ${WIREMOCK_NET} || { echo "Network creation failed" && exit 1; }

  echo "Starting wiremock server for bear integrated tests"
  $_WIREMOCK_START detached
  echo "Starting wiremock server for tiger integrated tests"
  $_TIGER_WIREMOCK_START detached
}

#
# Stop wiremock server(s) & destroy the network
#
stop_wiremocks() {
  echo "Stopping wiremock server for bear integrated tests."
  $_WIREMOCK_STOP

  echo "Stopping wiremock server for tiger integrated tests."
  $_TIGER_WIREMOCK_STOP

  docker network rm ${WIREMOCK_NET}
}

# ---------------------------------------------------------------------
# The execution of the actual tasks
# ---------------------------------------------------------------------

if ! start_wiremocks; then
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
  fi

  if [ $RC -eq 0 ]; then
    $_RUSH validate-ci
    RC=$?
  fi

  if [ $RC -eq 0 ]; then
    #
    # Explicitly limiting parallelism during tests; this is because Jest already does parallel test execution on
    # per-project basis.
    #

    $_RUSH test-ci --parallelism 4
    RC=$?
  fi

  stop_wiremocks
} || {
  stop_wiremocks
}

exit ${RC}
