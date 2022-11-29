#!/bin/bash

set -e

cd "$(dirname "$0")/.."

BUILD_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-node-16:node-16.13.0-yarn-1.22.17'

CYPRESS_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-cypress-included:9db8137'

CYPRESS_HOST="https://${CYPRESS_HOST}"

echo "⭐️ 1/7 Install project dependencies and build it to dist"
docker run \
    -e USERID=$(id -u $USER) \
    -e FORCE_COLOR=0 \
    -w /workspace \
    -v "$(pwd)":/workspace \
    -t $BUILD_IMAGE \
    sh -c "npm config set '//registry.npmjs.org/:_authToken' $NPM_TOKEN && yarn install --frozen-lockfile && yarn dist" || exit 1

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
    -e SDK_BACKEND=BEAR \
    -e HOST=$CYPRESS_HOST \
    -e USER_NAME=$TEST_USER_NAME \
    -e PASSWORD=$TEST_USER_PASSWORD \
    -e AUTH_TOKEN=$TEST_PROJECT_TOKEN \
    -e FIXTURE_TYPE=goodsales \
    -e NO_COLOR=1 \
    -e BUILD_URL=$BUILD_URL \
    -w /workspace/test_new \
    -v "$(pwd)":/workspace \
    $CYPRESS_IMAGE


echo "⭐️ 4/7 build KD docker container from dist"
IMAGE_ID=bear-kpi-dashboards-${EXECUTOR_NUMBER}
trap "docker rmi --force $IMAGE_ID || true" EXIT

docker build --file ./Dockerfile_local -t $IMAGE_ID .

echo "⭐️ 5/7 create new recording (host: $CYPRESS_HOST, test: $CYPRESS_RECORDED_TEST)"
cd test_new
rm -rf ./recordings/mappings

USER_UID=$(id -u $USER) \
USER_GID=$(id -g $USER) \
IMAGE_ID=$IMAGE_ID \
HOST=$CYPRESS_HOST \
USER_NAME=$TEST_USER_NAME \
PASSWORD=$TEST_USER_PASSWORD \
SDK_BACKEND=BEAR \
FILTER=$CYPRESS_RECORDED_TEST \
CYPRESS_TEST_TAGS=pre-merge_isolated_bear \
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
    -e HOST=$CYPRESS_HOST \
    -e USER_NAME=$TEST_USER_NAME \
    -e PASSWORD=$TEST_USER_PASSWORD \
    -e SDK_BACKEND=BEAR \
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
