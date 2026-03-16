#!/bin/bash
# (C) 2021-2025 GoodData Corporation

#*
# Run Isolated tests
# This is useful to run isolated tests. Supports also record mode.
#
# MODE record | test (optional, defaults to test)
# TEST_WORKSPACE_ID (mandatory when MODE is record) workspace created for recording

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs -0)
fi

if [[ $MODE = "record" ]] && [[ -z $TEST_WORKSPACE_ID ]]; then
    echo "Isolated tests need TEST_WORKSPACE_ID"
    exit 1
fi

if [[ ! "$HOST" =~ ^http ]]; then
    export HOST="https://$HOST"
fi

if [ "$MODE" = "record" ]; then
    COMPOSE_FILE="docker-compose-isolated-record.yaml"
    echo "Running in RECORD mode (Playwright)"
else
    COMPOSE_FILE="docker-compose-isolated.yaml"
    echo "Running isolated tests (Playwright)"
fi

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
docker compose -f ./$COMPOSE_FILE -p sdk-ui-tests-e2e-$BUILD_ID up --abort-on-container-exit --exit-code-from isolated-tests --force-recreate --always-recreate-deps --renew-anon-volumes
