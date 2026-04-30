#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../../ && pwd -P))

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

if [ -z "$TEST_WORKSPACE_ID" ] || [ -z "$TEST_CHILD_WORKSPACE_ID" ]; then
  pushd $REF_WS_DIR
  CLI_CREATE_ARGS=(
      --prefix E2E_SDK_cypress_test
      --host "$HOST"
      --token "$TIGER_API_TOKEN"
      --datasource "$TIGER_DATASOURCES_NAME"
      --fixture-type "$FIXTURE_TYPE"
      --metadata-extension-local "fixtures/$FIXTURE_TYPE/tiger_metadata_extension.json"
  )

  echo "Creating reference workspaces..."
  eval "$(reference-workspace-cli create "${CLI_CREATE_ARGS[@]}")"
  echo "TEST_WORKSPACE_ID=$TEST_WORKSPACE_ID"
  echo "TEST_CHILD_WORKSPACE_ID=$TEST_CHILD_WORKSPACE_ID"
  export TEST_WORKSPACE_ID TEST_CHILD_WORKSPACE_ID
  popd
fi

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

cleanup() {
    echo "Executing cleanup before exiting..."
    rm -f $REF_WS_DIR/.env $E2E_TEST_DIR/.env
    if [ -z "$_PREBUILT" ]; then
      docker rmi --force $IMAGE_URL || true
    fi
}

trap cleanup EXIT

export WORKSPACE_ID="$TEST_WORKSPACE_ID"

if [ -n "$IMAGE_URL" ]; then
    echo "Using pre-built app image: $IMAGE_URL"
    _PREBUILT=true
else
    # Pack the pre-built dist into a tarball for Docker (WORKSPACE_ID is injected at container runtime)
    (cd $APP_DIR; npm run _phase:pack-build)
    export IMAGE_URL=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER:-default}
    docker build --no-cache -t $IMAGE_URL $APP_DIR || exit 1
fi

pushd $E2E_TEST_DIR

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}
docker compose -f docker-compose-integrated.yaml -p "$PROJECT_NAME" up \
  --abort-on-container-exit --exit-code-from integrated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes
