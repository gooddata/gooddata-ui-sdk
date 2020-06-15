#!/bin/bash

ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))

#
# Note: this script assumes that the wiremock is already running. The script is run from inside the docker image
# and at the moment (when we use barebone `node` image) it is not possible to start sibling containers from it
#

JEST_JUNIT_OUTPUT=./ci/results/test-results.xml jest --ci --config jest.ci.js
UNIT_RC=$?

JEST_JUNIT_OUTPUT=./ci/results/integrated-test-results.xml NODE_TLS_REJECT_UNAUTHORIZED=0 jest --config "integrated-test.config.js"
INTEGRATED_RC=$?

if [[ $UNIT_RC -ne 0 || $INTEGRATED_RC -ne 0 ]]; then
  exit 1
fi

exit 0
