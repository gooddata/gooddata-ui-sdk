#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))

APP_DIR=$ROOT_DIR/libs/sdk-ui-tests-app
REF_WS_DIR=$ROOT_DIR/libs/sdk-ui-tests-reference-workspace
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e

if [[ ! "${TEST_BACKEND:?}" =~ https?:// ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

export TEST_BACKEND_NO_PREFIX=$(sed <<< $TEST_BACKEND -E "s#^https?:\/\/##")

export HOST=${TEST_BACKEND}
export TEST_BACKEND=${TEST_BACKEND:-}
export PLAYWRIGHT_GREP=${PLAYWRIGHT_GREP:-}
export FIXTURE_TYPE=goodsales
export FILTER=${FILTER:-}
export TIGER_API_TOKEN=${TIGER_API_TOKEN:?}
export TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:?}

if [ -n "$GDC_UI" ]; then
  RUSH_REPO_ROOT="../../.."
else
  RUSH_REPO_ROOT="../.."
fi

(cd $REF_WS_DIR && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js create-ref-workspace)
WORKSPACE_CREATED=true
DELETE_MODE="${DELETE_MODE:-delete_always}"

# Read workspace IDs created by create-ref-workspace
export TEST_WORKSPACE_ID=$(grep "^TEST_WORKSPACE_ID=" $REF_WS_DIR/.env | cut -d= -f2)
export TEST_CHILD_WORKSPACE_ID=$(grep "^TEST_CHILD_WORKSPACE_ID=" $REF_WS_DIR/.env | cut -d= -f2)

# Write .env for the e2e tests
cat > $E2E_TEST_DIR/.env <<-EOF
HOST=${HOST}
TEST_WORKSPACE_ID=${TEST_WORKSPACE_ID}
TEST_CHILD_WORKSPACE_ID=${TEST_CHILD_WORKSPACE_ID}
PLAYWRIGHT_GREP=${PLAYWRIGHT_GREP}
FIXTURE_TYPE=${FIXTURE_TYPE}
FILTER=${FILTER:-}
TIGER_API_TOKEN=${TIGER_API_TOKEN}
TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME}
EOF

# Pack the pre-built dist into a tarball for Docker (WORKSPACE_ID is injected at container runtime)
export WORKSPACE_ID="$TEST_WORKSPACE_ID"
(cd $APP_DIR; npm run pack-build)

export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER:-default}

cleanup() {
    echo "Executing cleanup before exiting..."
    # remove previously created workspace
    if [ -n "$WORKSPACE_CREATED" ]; then
      if [ $DELETE_MODE = "delete_never" ]; then
        echo "DELETE_MODE is delete_never, skip deleting the created workspace"
      else
        (cd $REF_WS_DIR && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js delete-ref-workspace)
      fi
    fi
    rm -f $REF_WS_DIR/.env $E2E_TEST_DIR/.env
    docker rmi --force $IMAGE_ID || true
}

trap cleanup EXIT

pushd $E2E_TEST_DIR

# Build docker image from the app package
docker build --no-cache -t $IMAGE_ID $APP_DIR || exit 1

if [ -n "$GDC_UI" ]; then
  COMPOSE_FILE="docker-compose-integrated-gdcui.yaml"
else
  COMPOSE_FILE="docker-compose-integrated.yaml"
fi

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}
docker compose -f $COMPOSE_FILE -p "$PROJECT_NAME" up \
  --abort-on-container-exit --exit-code-from integrated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes
