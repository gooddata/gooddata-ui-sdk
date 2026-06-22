#!/bin/bash
set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../../ && pwd -P))
APP_DIR=$ROOT_DIR/libs/sdk-ui-tests-app
REF_WS_DIR=$ROOT_DIR/libs/sdk-ui-tests-reference-workspace

if [ "$ISOLATED_MODE" = "record" ]; then
    COMPOSE_FILE="docker-compose-isolated-record.yaml"
else
    COMPOSE_FILE="docker-compose-isolated.yaml"
    export GOODMOCK_MODE=replay
fi

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}

NO_COLOR=1 docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up \
    --no-build \
    --abort-on-container-exit \
    --exit-code-from e2e-tests \
    --force-recreate \
    --always-recreate-deps \
    --renew-anon-volumes \
    --no-color
