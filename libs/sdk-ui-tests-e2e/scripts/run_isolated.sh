#!/bin/bash
# (C) 2021-2022 GoodData Corporation

#*
# Run Isolated tests
# This is useful to run isolated tests. Supports also record mode.
#
# CYPRESS_TEST_TAGS (mandatory) list of tags compatible with chosen backend
# MODE record | test (optional, defaults to test)
# TEST_WORKSPACE_ID (mandatory when ISOLATED_MODE is record) workspace created for recording

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs -0)
fi

if [[ $MODE = "record" ]] && [[ -z $TEST_WORKSPACE_ID ]]; then
    echo "Isolated tests need TEST_WORKSPACE_ID"
    exit 1
fi

if [ -z "$CYPRESS_TEST_TAGS" ]; then
    echo "Isolated tests need CYPRESS_TEST_TAGS."
    exit 1
fi

echo "Running with mode $MODE"
echo "Filtering by tags: $CYPRESS_TEST_TAGS"

COMPOSE_FILE="docker-compose-isolated.yaml"

if [ -z "$IMAGE_ID" ]; then
    echo "Build docker image with what's already in the 'scenarios/build' folder, using IMAGE_ID=gooddata-ui-sdk"
    docker build --file ../Dockerfile_local -t gooddata-ui-sdk ..
    export IMAGE_ID=gooddata-ui-sdk
else
    echo "Skipping image build, using given image in IMAGE_ID: $IMAGE_ID"
fi

echo "Run tests in Docker"
cd "$(dirname "$0")/.."
docker compose -f ./$COMPOSE_FILE  -p sdk-ui-tests-e2e-$BUILD_ID up --abort-on-container-exit --exit-code-from isolated-tests --force-recreate --always-recreate-deps --renew-anon-volumes
