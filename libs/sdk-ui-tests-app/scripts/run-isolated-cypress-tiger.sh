#!/bin/bash
# (C) 2025 GoodData Corporation

cd "$(dirname "$0")/.."

set -ex

export IMAGE_ID=sdk-ui-tests-app-${EXECUTOR_NUMBER:-default}

trap "docker rmi --force $IMAGE_ID || true" EXIT

# Prepare .env, build the vite dist and pack into a tarball for the docker image
npm run prepare-env && npm run dist && npm run pack-build

docker build -t $IMAGE_ID . || exit 1

export BUILD_URL=$BUILD_URL
export NPM_TOKEN=$NPM_TOKEN

# Derive Playwright shard from RUNNER/RUNNERS_COUNT (e.g. "runner2" → 2/4)
# This ensures sharding works regardless of which workflow version triggers the run.
if [ -n "$RUNNER" ] && [ -n "$RUNNERS_COUNT" ]; then
    export SHARD_INDEX=${RUNNER//[!0-9]/}
    export SHARD_TOTAL=$RUNNERS_COUNT
fi

../sdk-ui-tests-e2e/scripts/run_isolated.sh
