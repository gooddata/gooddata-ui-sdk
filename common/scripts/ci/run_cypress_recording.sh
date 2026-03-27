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
(cd $REF_WS_DIR && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js create-ref-workspace)

# Read workspace IDs created by create-ref-workspace
export TEST_WORKSPACE_ID=$(grep "^TEST_WORKSPACE_ID=" $REF_WS_DIR/.env | cut -d= -f2)
export TEST_CHILD_WORKSPACE_ID=$(grep "^TEST_CHILD_WORKSPACE_ID=" $REF_WS_DIR/.env | cut -d= -f2)

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

echo "⭐️ Build gooddata-ui-sdk-scenarios"
export WORKSPACE_ID="$TEST_WORKSPACE_ID"
(cd $APP_DIR; npm run pack-build)

echo "⭐️ Build docker container from gooddata-ui-sdk-scenarios"
export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER:-default}
trap "rm -f $REF_WS_DIR/.env $E2E_TEST_DIR/.env; docker rmi --force $IMAGE_ID || true" EXIT

pushd $E2E_TEST_DIR
rm -rf ./recordings/mappings
mkdir -p ./recordings/mappings/TIGER
docker build --no-cache -t $IMAGE_ID $APP_DIR || exit 1

echo "⭐️ Run isolated recording against TEST_BACKEND=$TEST_BACKEND (Playwright)"
PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}

if [ -n "$GDC_UI" ]; then
  COMPOSE_FILE="docker-compose-isolated-record-gdcui.yaml"
else
  COMPOSE_FILE="docker-compose-isolated-record.yaml"
fi

NO_COLOR=1 docker compose -f $COMPOSE_FILE -p "$PROJECT_NAME" up \
    --abort-on-container-exit --exit-code-from isolated-tests \
    --force-recreate --always-recreate-deps --renew-anon-volumes --no-color

echo "⭐️ Delete reference workspace on the host"
(cd $REF_WS_DIR && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js delete-ref-workspace)
