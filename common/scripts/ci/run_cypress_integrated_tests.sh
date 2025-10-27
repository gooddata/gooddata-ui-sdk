#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))

E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e

if [[ ! "${TEST_BACKEND:?}" =~ https?:// ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

export TEST_BACKEND_NO_PREFIX=$(sed <<< $TEST_BACKEND -E "s#^https?:\/\/##")

export HOST=${TEST_BACKEND}
export TEST_BACKEND=${TEST_BACKEND:-}
export CYPRESS_TEST_TAGS=${CYPRESS_TEST_TAGS:-}
export FIXTURE_TYPE=goodsales
export FILTER=${FILTER:-}
export TIGER_API_TOKEN=${TIGER_API_TOKEN:?}
export TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:?}

if [ -n "$GDC_UI" ]; then
  RUSH_REPO_ROOT="../../.."
else
  RUSH_REPO_ROOT="../.."
fi

(cd $ROOT_DIR/libs/sdk-ui-tests-e2e && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js create-ref-workspace)
WORKSPACE_CREATED=true
DELETE_MODE="${DELETE_MODE:-delete_always}"
# Set Node.js memory limit for build-scenarios to 6GB
export NODE_OPTIONS="--max-old-space-size=6144 ${NODE_OPTIONS:-}"
(cd $ROOT_DIR/libs/sdk-ui-tests-e2e && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js build-scenarios)
export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER:-default}

cleanup() {
    echo "Executing cleanup before exiting..."
    # remove previously created workspace
    if [ -n "$WORKSPACE_CREATED" ]; then
      if [ $DELETE_MODE = "delete_never" ]; then
        echo "DELETE_MODE is delete_never, skip deleting the created workspace"
      else
        node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js delete-ref-workspace
      fi
    fi
    rm -f $E2E_TEST_DIR/.env
    docker rmi --force $IMAGE_ID || true
}

trap cleanup EXIT

pushd $E2E_TEST_DIR

# Use Dockerfile_local as scenarios have been build in previous steps
docker build --no-cache --file Dockerfile_local -t $IMAGE_ID . || exit 1

if [[ "$GITHUB_ACTIONS" != "true" ]]; then
    export USER_UID=$(id -u $USER)
    export USER_GID=$(id -g $USER)
fi


if [ -n "$GDC_UI" ]; then
  COMPOSE_FILE="docker-compose-integrated-gdcui.yaml"
else
  COMPOSE_FILE="docker-compose-integrated.yaml"
fi

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}
docker compose -f $COMPOSE_FILE -p "$PROJECT_NAME" up \
  --abort-on-container-exit --exit-code-from integrated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes
