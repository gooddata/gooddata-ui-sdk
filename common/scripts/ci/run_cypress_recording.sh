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
export CYPRESS_TEST_TAGS=pre-merge_isolated_tiger
export FIXTURE_TYPE=goodsales
export FILTER=${FILTER:-}

echo "⭐️ Create reference workspace"
(cd libs/sdk-ui-tests-e2e && node ../../common/scripts/install-run-rushx.js create-ref-workspace)

echo "⭐️ Build gooddata-ui-sdk-scenarios"
(cd libs/sdk-ui-tests-e2e && node ../../common/scripts/install-run-rushx.js build-scenarios)

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
MODE=record NO_COLOR=1 docker compose -f docker-compose-isolated.yaml -p "$PROJECT_NAME" up \
    --abort-on-container-exit --exit-code-from isolated-tests \
    --force-recreate --always-recreate-deps --renew-anon-volumes --no-color

echo "⭐️ Delete reference workspace on the host"
node $ROOT_DIR/common/scripts/install-run-rushx.js delete-ref-workspace
