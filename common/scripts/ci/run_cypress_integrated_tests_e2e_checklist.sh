#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
APP_DIR=$ROOT_DIR/libs/sdk-ui-tests-app
REF_WS_DIR=$ROOT_DIR/libs/sdk-ui-tests-reference-workspace
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

if [[ ! "${TEST_BACKEND:?}" =~ https?:// ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

export TEST_BACKEND_NO_PREFIX=$(sed <<< $TEST_BACKEND -E "s#^https?:\/\/##")

pushd $E2E_TEST_DIR
cat > .env <<-EOF
HOST=${TEST_BACKEND:-}
PLAYWRIGHT_GREP=@post-merge
FIXTURE_TYPE=goodsales
FILTER=${FILTER:-}
EOF

cat >> .env <<-EOF
TIGER_API_TOKEN=${TIGER_API_TOKEN:?}
TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:?}
EOF

$_RUSH install
$_RUSH build -t sdk-ui-tests-e2e
$_RUSHX libs/sdk-ui-tests-reference-workspace create-ref-workspace
WORKSPACE_CREATED=true
DELETE_MODE="${DELETE_MODE:-delete_always}"

# Read workspace IDs created by create-ref-workspace
export TEST_WORKSPACE_ID=$(grep "^TEST_WORKSPACE_ID=" $REF_WS_DIR/.env | cut -d= -f2)
export TEST_CHILD_WORKSPACE_ID=$(grep "^TEST_CHILD_WORKSPACE_ID=" $REF_WS_DIR/.env | cut -d= -f2)

# Write .env for the app (needed for vite build)
cat > $APP_DIR/.env <<-EOF
HOST=${TEST_BACKEND:-}
TEST_WORKSPACE_ID=${TEST_WORKSPACE_ID}
EOF

# Append workspace IDs to the e2e .env
cat >> $E2E_TEST_DIR/.env <<-EOF
TEST_WORKSPACE_ID=${TEST_WORKSPACE_ID}
TEST_CHILD_WORKSPACE_ID=${TEST_CHILD_WORKSPACE_ID}
EOF

# Build the vite dist and pack into a tarball for the docker image
$_RUSHX libs/sdk-ui-tests-app dist
$_RUSHX libs/sdk-ui-tests-app pack-build

export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER}

cleanup() {
    echo "Executing cleanup before exiting..."
    # remove previously created workspace
    if [ -n "$WORKSPACE_CREATED" ]; then
      if [ $DELETE_MODE = "delete_never" ]; then
        echo "DELETE_MODE is delete_never, skip deleting the created workspace"
      else
        $_RUSHX libs/sdk-ui-tests-reference-workspace delete-ref-workspace
      fi
    fi
    rm -f $APP_DIR/.env $REF_WS_DIR/.env $E2E_TEST_DIR/.env
    docker rmi --force $IMAGE_ID || true
}

trap cleanup EXIT

# Build docker image from the app package
docker build --no-cache -t $IMAGE_ID $APP_DIR || exit 1

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER}
NO_COLOR=1 docker compose -f docker-compose-integrated.yaml -p "$PROJECT_NAME" up \
  --abort-on-container-exit --exit-code-from integrated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes --no-color
