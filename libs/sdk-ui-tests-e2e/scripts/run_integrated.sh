#!/bin/bash
# (C) 2021-2025 GoodData Corporation

#*
# Run Integrated tests
# This is useful to run integrated tests for tiger.
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
    echo "Build docker image from sdk-ui-tests-app, using IMAGE_ID=sdk-ui-tests-app"
    (cd ../sdk-ui-tests-app; npm run prepare-env && npm run dist && npm run pack-build)
    docker build -t sdk-ui-tests-app ../sdk-ui-tests-app
    export IMAGE_ID=sdk-ui-tests-app
else
    echo "Skipping image build, using given image in IMAGE_ID: $IMAGE_ID"
fi

echo "Run tests in Docker"
cd "$(dirname "$0")/.."
docker compose -f ./$COMPOSE_FILE -p sdk-ui-tests-e2e-$BUILD_ID up --abort-on-container-exit --exit-code-from integrated-tests --force-recreate --always-recreate-deps --renew-anon-volumes
