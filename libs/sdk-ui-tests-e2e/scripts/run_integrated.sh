#!/bin/bash
# (C) 2021-2022 GoodData Corporation

#*
# Run Integrated tests
# This is useful to run integrated tests for bear/tiger.
#
# SDK_BACKEND BEAR | TIGER (mandatory)
# CYPRESS_TEST_TAGS (mandatory) list of tags compatible with chosen backend
# TEST_WORKSPACE_ID workspace
#
# Note that you need to make sure that the tests you choose by the tags can
# run against the SDK_BACKEND you provide

if [ -z "$JENKINS_URL" ]; then
    export $(grep -v '^#' .env | xargs -0)
fi

if [ -z "$SDK_BACKEND" ]; then
    echo "Integrated tests need SDK_BACKEND"
    exit 1
fi

if [[ -z $TEST_WORKSPACE_ID ]]; then
    echo "Integrated tests need TEST_WORKSPACE_ID"
    exit 1
fi

if [ -z "$CYPRESS_TEST_TAGS" ]; then
    echo "Integrated tests need CYPRESS_TEST_TAGS. Make sure tags combination is compatible with SDK_BACKEND"
    exit 1
fi

echo "Running against $SDK_BACKEND"
echo "Filtering by tags: $CYPRESS_TEST_TAGS"

COMPOSE_FILE="docker-compose-integrated.yaml"

if [ -z "$IMAGE_ID" ]; then
    echo "Build docker image with what's already in the 'scenarios/build' folder, using IMAGE_ID=gooddata-ui-sdk"
    docker build --file ../Dockerfile_local -t gooddata-ui-sdk ..
    export IMAGE_ID=gooddata-ui-sdk
else
    echo "Skipping image build, using given image in IMAGE_ID: $IMAGE_ID"
fi

echo "Run tests in Docker"
cd "$(dirname "$0")/.."
docker-compose -f ./$COMPOSE_FILE  -p sdk-ui-tests-e2e-$BUILD_ID up --abort-on-container-exit --exit-code-from integrated-tests --force-recreate --always-recreate-deps --renew-anon-volumes
