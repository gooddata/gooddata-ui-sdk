#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$CURRENT_DIR/../../.."

#
# Environment variables to propagate to docker
#
export CI=true

#
# Build image => installs deps and runs 'build'
#

docker build \
    --no-cache \
    --build-arg CI \
    -t gooddata/gooddata-ui-sdk \
    -f "$ROOT_DIR/Dockerfile" "$ROOT_DIR/"

#
# Runs tests within container containing built SDK
#

docker run \
  --rm gooddata/gooddata-ui-sdk \
  --env CI \
  node "./common/scripts/install-run-rush.js" test-ci
