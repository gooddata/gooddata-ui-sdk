#!/bin/bash

set -e

CYPRESS_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/cypress/included:13.17.0'
DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e

echo "⭐️ Preparing env for recording"
if [[ ! "${TEST_BACKEND:?}" =~ 'https://' ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

export TIGER_DATASOURCES_NAME=vertica_staging-goodsales
export HOST=$TEST_BACKEND
export CYPRESS_TEST_TAGS=pre-merge_isolated_tiger_fe
export FIXTURE_TYPE=goodsales
export FILTER=${FILTER:-}

if [ -n "$GDC_UI" ]; then
  RUSH_REPO_ROOT="../../.."
else
  RUSH_REPO_ROOT="../.."
fi

echo "⭐️ Create reference workspace"
(cd $ROOT_DIR/libs/sdk-ui-tests-e2e && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js create-ref-workspace)

echo "⭐️ Build gooddata-ui-sdk-scenarios"
(cd $ROOT_DIR/libs/sdk-ui-tests-e2e && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js build-scenarios)

echo "⭐️ Build docker container from gooddata-ui-sdk-scenarios"
export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER:-default}
trap "docker rmi --force $IMAGE_ID || true" EXIT


pushd $E2E_TEST_DIR
rm -rf ./recordings/mappings
mkdir -p ./recordings/mappings/TIGER
docker build --no-cache --file Dockerfile_local -t $IMAGE_ID . || exit 1

echo "⭐️ Run isolated recording against TEST_BACKEND=$TEST_BACKEND."
if [[ "$GITHUB_ACTIONS" != "true" ]]; then
    export USER_UID=$(id -u $USER)
    export USER_GID=$(id -g $USER)
fi
PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}

if [ -n "$GDC_UI" ]; then
  COMPOSE_FILE="docker-compose-isolated-gdcui.yaml"
else
  COMPOSE_FILE="docker-compose-isolated.yaml"
fi

MODE=record NO_COLOR=1 docker compose -f $COMPOSE_FILE -p "$PROJECT_NAME" up \
    --abort-on-container-exit --exit-code-from isolated-tests \
    --force-recreate --always-recreate-deps --renew-anon-volumes --no-color

echo "⭐️ Delete reference workspace on the host"
(cd $ROOT_DIR/libs/sdk-ui-tests-e2e && node $RUSH_REPO_ROOT/common/scripts/install-run-rushx.js delete-ref-workspace)
