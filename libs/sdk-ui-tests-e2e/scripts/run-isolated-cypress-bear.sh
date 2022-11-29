#!/bin/bash
set -ex

cd "$(dirname "$0")/.."

BUILD_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-node-16:node-16.13.0-yarn-1.22.17'

export IMAGE_ID=bear-kpi-dashboards-${EXECUTOR_NUMBER}

trap "docker rmi --force $IMAGE_ID || true" EXIT

docker build --build-arg DIST_MODE=dist --build-arg NPM_TOKEN=$NPM_TOKEN -t $IMAGE_ID . || exit 1

export SDK_BACKEND=BEAR
export CYPRESS_TEST_TAGS=pre-merge_isolated_bear
export BUILD_URL=$BUILD_URL
export NO_COLOR=1
export NPM_TOKEN=$NPM_TOKEN

docker run \
    -e USERID=$(id -u $USER) \
    -e FORCE_COLOR=0 \
    -e NPM_TOKEN=${NPM_TOKEN} \
    -w /workspace/test_new \
    -v "$(pwd)":/workspace \
    -t $BUILD_IMAGE \
    sh -c "./scripts/set-npm-token.sh && yarn install --frozen-lockfile" || exit 1

./test_new/scripts/run_isolated.sh
