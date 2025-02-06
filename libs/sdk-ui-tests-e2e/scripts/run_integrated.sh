#!/bin/bash
# (C) 2021-2022 GoodData Corporation

#*
# Run Integrated tests
# This is useful to run integrated tests for bear/tiger.
#
# CYPRESS_TEST_TAGS (mandatory) list of tags compatible with chosen backend
# TEST_WORKSPACE_ID workspace


if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs -0)
fi

if [[ -z $TEST_WORKSPACE_ID ]]; then
    echo "Integrated tests need TEST_WORKSPACE_ID"
    exit 1
fi

if [ -z "$CYPRESS_TEST_TAGS" ]; then
    echo "Integrated tests need CYPRESS_TEST_TAGS."
    exit 1
fi

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
docker compose -f ./$COMPOSE_FILE  -p sdk-ui-tests-e2e-$BUILD_ID up --abort-on-container-exit --exit-code-from integrated-tests --force-recreate --always-recreate-deps --renew-anon-volumes
