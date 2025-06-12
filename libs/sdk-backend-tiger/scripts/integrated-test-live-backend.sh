#!/bin/bash
set -e
ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))
TESTS_DIR="${ROOT_DIR}/tests"

NODE_TLS_REJECT_UNAUTHORIZED=0 vitest --config vite.integrated.config.ts run
exit 0
