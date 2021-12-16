#!/bin/bash

ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))
TESTS_DIR="${ROOT_DIR}/tests"
WIREMOCK_DIR="${TESTS_DIR}/wiremock"

#
# Directly call the start_wiremock script. While going through `npm run start-wiremock` is possible, that approach
# is susceptible to breakage in dockerized runs as some env variables get lost.
#
${WIREMOCK_DIR}/start_wiremock.sh detached
WIREMOCK_RC=$?

if [ $WIREMOCK_RC -ne 0 ]; then
  echo "Failed to start wiremock. Please make sure Docker is installed and up and running. If running, check for port conflicts."
  exit 1
fi

NODE_TLS_REJECT_UNAUTHORIZED=0 jest --config "integrated-test.config.js" --watch
INTEGRATED_RC=$?

${WIREMOCK_DIR}/stop_wiremock.sh

if [ $INTEGRATED_RC -ne 0 ]; then
  exit 1
fi

exit 0
