#!/bin/bash

set -e

export TEST_BACKEND_NO_PREFIX=$(sed <<< $TEST_BACKEND -E "s#^https?:\/\/##")

export HOST=${TEST_BACKEND}

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}
docker compose -f docker-compose-integrated.yaml -p "$PROJECT_NAME" up \
    --abort-on-container-exit \
    --exit-code-from e2e-tests \
    --force-recreate \
    --always-recreate-deps \
    --renew-anon-volumes
