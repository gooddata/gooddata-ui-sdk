#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
APP_DIR=$ROOT_DIR/libs/sdk-ui-tests-app
REF_WS_DIR=$ROOT_DIR/libs/sdk-ui-tests-reference-workspace
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e

echo "⭐️ Preparing env for recording"
if [[ ! "${TEST_BACKEND:?}" =~ 'https://' ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

export TIGER_DATASOURCES_NAME=vertica_staging-goodsales
export HOST=$TEST_BACKEND
export FIXTURE_TYPE=goodsales
export FILTER=${FILTER:-}

if [ -n "$GDC_UI" ]; then
  RUSH_REPO_ROOT="../../.."
else
  RUSH_REPO_ROOT="../.."
fi

echo "⭐️ Create reference workspace"
if [ -n "$IMAGE_URL" ]; then
    # Pre-built mode: use reference-workspace-cli
    pushd $REF_WS_DIR
    eval "$(reference-workspace-cli create \
        --prefix E2E_SDK_cypress_test \
        --host "$HOST" \
        --token "$TIGER_API_TOKEN" \
        --datasource "$TIGER_DATASOURCES_NAME" \
        --fixture-type "$FIXTURE_TYPE" \
        --metadata-extension-local "fixtures/$FIXTURE_TYPE/tiger_metadata_extension.json")"
    echo "TEST_WORKSPACE_ID=$TEST_WORKSPACE_ID"
    echo "TEST_CHILD_WORKSPACE_ID=$TEST_CHILD_WORKSPACE_ID"
    export TEST_WORKSPACE_ID TEST_CHILD_WORKSPACE_ID
    popd
else
    (cd $REF_WS_DIR && npm run create-ref-workspace)
    # Read workspace IDs created by create-ref-workspace
    export TEST_WORKSPACE_ID=$(grep "^TEST_WORKSPACE_ID=" $REF_WS_DIR/.env | cut -d= -f2)
    export TEST_CHILD_WORKSPACE_ID=$(grep "^TEST_CHILD_WORKSPACE_ID=" $REF_WS_DIR/.env | cut -d= -f2)
fi

# Write .env for the e2e tests
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
    echo "Executing cleanup before exiting..."
    if [ -n "$_PREBUILT" ]; then
        echo "Deleting reference workspaces..."
        (cd $REF_WS_DIR && reference-workspace-cli delete \
            --host "$HOST" --token "$TIGER_API_TOKEN" \
            "$TEST_CHILD_WORKSPACE_ID" \
            "$TEST_WORKSPACE_ID") || true
    fi
    rm -f $REF_WS_DIR/.env $E2E_TEST_DIR/.env
    if [ -z "$_PREBUILT" ]; then
      docker rmi --force $IMAGE_URL || true
    fi
}

trap cleanup EXIT

export WORKSPACE_ID="$TEST_WORKSPACE_ID"

if [ -n "$IMAGE_URL" ]; then
    echo "⭐️ Using pre-built app image: $IMAGE_URL"
    _PREBUILT=true
else
    echo "⭐️ Build gooddata-ui-sdk-scenarios"
    (cd $APP_DIR; npm run pack-build)
    echo "⭐️ Build docker container from gooddata-ui-sdk-scenarios"
    export IMAGE_URL=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER:-default}
    docker build --no-cache -t $IMAGE_URL $APP_DIR || exit 1
fi

pushd $E2E_TEST_DIR
rm -rf ./recordings/mappings
mkdir -p ./recordings/mappings/TIGER

echo "⭐️ Run isolated recording against TEST_BACKEND=$TEST_BACKEND (Playwright)"
PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}

if [ -n "$GDC_UI" ]; then
  COMPOSE_FILE="docker-compose-isolated-record-gdcui.yaml"
else
  COMPOSE_FILE="docker-compose-isolated-record.yaml"
fi

NO_BUILD=""
if [ -n "$E2E_IMAGE_URL" ]; then
    NO_BUILD="--no-build"
fi

NO_COLOR=1 docker compose -f $COMPOSE_FILE -p "$PROJECT_NAME" up $NO_BUILD \
    --abort-on-container-exit --exit-code-from isolated-tests \
    --force-recreate --always-recreate-deps --renew-anon-volumes --no-color

if [ -z "$_PREBUILT" ]; then
    echo "⭐️ Delete reference workspace on the host"
    (cd $REF_WS_DIR && npm run delete-ref-workspace)
fi
