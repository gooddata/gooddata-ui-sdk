#!/bin/bash
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$CURRENT_DIR/../../.."

docker build --no-cache -t gooddata/gooddata-ui-sdk -f "$ROOT_DIR/Dockerfile" "$ROOT_DIR/"
docker run --rm gooddata/gooddata-ui-sdk node "./common/scripts/install-run-rush.js" test-ci
