#!/bin/bash
set -e
ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))
TESTS_DIR="${ROOT_DIR}/tests"

NODE_TLS_REJECT_UNAUTHORIZED=0 jest --config "integrated-test.config.js" -e
exit 0
