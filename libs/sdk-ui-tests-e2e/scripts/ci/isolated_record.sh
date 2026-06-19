#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../../ && pwd -P))
APP_DIR=$ROOT_DIR/libs/sdk-ui-tests-app
REF_WS_DIR=$ROOT_DIR/libs/sdk-ui-tests-reference-workspace
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e

if [[ ! "${TEST_BACKEND:?}" =~ 'https://' ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

export TIGER_DATASOURCES_NAME=vertica_staging-goodsales
export HOST=$TEST_BACKEND
export FIXTURE_TYPE=goodsales
export FILTER=${FILTER:-}

cat > $E2E_TEST_DIR/.env <<-EOF
HOST=${HOST}
TEST_WORKSPACE_ID=${TEST_WORKSPACE_ID}
TEST_CHILD_WORKSPACE_ID=${TEST_CHILD_WORKSPACE_ID}
FIXTURE_TYPE=${FIXTURE_TYPE}
FILTER=${FILTER:-}
TIGER_API_TOKEN=${TIGER_API_TOKEN}
TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME}
EOF

cleanup() {
    rm -f $REF_WS_DIR/.env $E2E_TEST_DIR/.env
    if [ -z "$_PREBUILT" ]; then
      docker rmi --force $IMAGE_URL || true
    fi
}

trap cleanup EXIT

export WORKSPACE_ID="$TEST_WORKSPACE_ID"

if [ -n "$IMAGE_URL" ]; then
    _PREBUILT=true
else
    (cd $APP_DIR; npm run _phase:pack-build)
    export IMAGE_URL=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER:-default}
    docker build --no-cache -t $IMAGE_URL $APP_DIR || exit 1
fi

pushd $E2E_TEST_DIR
rm -rf ./recordings/mappings
mkdir -p ./recordings/mappings/TIGER

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}

NO_BUILD=""
if [ -n "$E2E_IMAGE_URL" ]; then
    NO_BUILD="--no-build"
fi

NO_COLOR=1 docker compose -f docker-compose-isolated-record.yaml -p "$PROJECT_NAME" up $NO_BUILD \
    --abort-on-container-exit --exit-code-from isolated-tests \
    --force-recreate --always-recreate-deps --renew-anon-volumes --no-color
