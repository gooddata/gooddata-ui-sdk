#!/bin/bash

set -e

cd "$(dirname "$0")/.."

BUILD_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-node-16:node-16.13.0-yarn-1.22.17'

CYPRESS_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-cypress-included:9db8137'

if [[ $TEST_BACKEND = "https://stable-automation.anywhere.gooddata.com" ]]; then
    if [[ $CYPRESS_RECORDED_TEST = "gettingStarted" ]]; then
        FIXTURE_TYPE='demo'
        TIGER_DATASOURCES_NAME='vertica_stable-demo'
        CYPRESS_TEST_TAGS='gettingStartedFlows_isolated_tiger'
    else
        FIXTURE_TYPE='goodsales'
        TIGER_DATASOURCES_NAME='vertica_stable-goodsales'
        CYPRESS_TEST_TAGS='pre-merge_isolated_tiger'
    fi
else
    if [[ $CYPRESS_RECORDED_TEST = "gettingStarted" ]]; then
        FIXTURE_TYPE='demo'
        TIGER_DATASOURCES_NAME='vertica_staging-demo'
        CYPRESS_TEST_TAGS='gettingStartedFlows_isolated_tiger'
    else
        FIXTURE_TYPE='goodsales'
        TIGER_DATASOURCES_NAME='vertica_staging-goodsales'
        CYPRESS_TEST_TAGS='pre-merge_isolated_tiger'
    fi
fi

echo "⭐️ 1/7 Install project dependencies and build it to dist"
docker run \
    -e USERID=$(id -u $USER) \
    -e FORCE_COLOR=0 \
    -w /workspace \
    -v "$(pwd)":/workspace \
    -t $BUILD_IMAGE \
    sh -c "npm config set '//registry.npmjs.org/:_authToken' $NPM_TOKEN && yarn install --frozen-lockfile && yarn dist-tiger" || exit 1

echo "⭐️ 2/7 install test project dependencies"
docker run \
    -e USERID=$(id -u $USER) \
    -e FORCE_COLOR=0 \
    -w /workspace/test_new \
    -v "$(pwd)":/workspace \
    -t $BUILD_IMAGE \
    sh -c "npm config set '//registry.npmjs.org/:_authToken' $NPM_TOKEN && yarn install --frozen-lockfile" || exit 1

echo "⭐️ 3/7 create reference workspace on the host"
chmod +x ./test_new/reference_workspace/create_ref_workspace.js
docker run --entrypoint reference_workspace/create_ref_workspace.js \
    -e USERID=$(id -u $USER) \
    -e FORCE_COLOR=0 \
    -e SDK_BACKEND=TIGER \
    -e HOST=$TEST_BACKEND \
    -e TIGER_API_TOKEN=$TIGER_API_TOKEN \
    -e FIXTURE_TYPE=$FIXTURE_TYPE \
    -e TIGER_DATASOURCES_NAME=$TIGER_DATASOURCES_NAME \
    -e NO_COLOR=1 \
    -e BUILD_URL=$BUILD_URL \
    -w /workspace/test_new \
    -v "$(pwd)":/workspace \
    $CYPRESS_IMAGE

echo "⭐️ 4/7 build KPI dashboards docker container from dist"
IMAGE_ID=tiger-kpi-dashboards-${EXECUTOR_NUMBER}
trap "docker rmi --force $IMAGE_ID || true" EXIT

docker build --file ./Dockerfile_local -t $IMAGE_ID .

echo "⭐️ 5/7 create new recording (host: $TEST_BACKEND, test: $CYPRESS_RECORDED_TEST)"
cd test_new
rm -rf ./recordings/mappings

USER_UID=$(id -u $USER) \
USER_GID=$(id -g $USER) \
IMAGE_ID=$IMAGE_ID \
HOST=$TEST_BACKEND \
TIGER_API_TOKEN=$TIGER_API_TOKEN \
SDK_BACKEND=TIGER \
FILTER=$CYPRESS_RECORDED_TEST \
CYPRESS_TEST_TAGS=$CYPRESS_TEST_TAGS \
TIGER_DATASOURCES_NAME=$TIGER_DATASOURCES_NAME \
NO_COLOR=1 \
ISOLATED_MODE=record \
./scripts/run_isolated.sh

#back to root now
cd ..

echo "⭐️ 6/7 delete reference workspace on the host"
chmod +x ./test_new/reference_workspace/delete_ref_workspace.js
docker run --entrypoint reference_workspace/delete_ref_workspace.js \
    -e USERID=$(id -u $USER) \
    -e FORCE_COLOR=0 \
    -e HOST=$TEST_BACKEND \
    -e TIGER_API_TOKEN=$TIGER_API_TOKEN \
    -e SDK_BACKEND=TIGER \
    -e NO_COLOR=1 \
    -e BUILD_URL=$BUILD_URL \
    -w /workspace/test_new \
    -v "$(pwd)":/workspace \
    $CYPRESS_IMAGE

echo "⭐️ 7/7 create file with test results that will be posted to pull request by the CI job"
chmod +x ./test_new/scripts/create_github_report.js
docker run --entrypoint scripts/create_github_report.js \
    -e FORCE_COLOR=0 \
    -e NO_COLOR=1 \
    -e BUILD_URL=$BUILD_URL \
    -w /workspace/test_new \
    -v "$(pwd)":/workspace \
    $CYPRESS_IMAGE
