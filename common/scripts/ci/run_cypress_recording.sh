#!/bin/bash

set -e

CYPRESS_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-cypress-factory:202311211156.11759a0'
DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

echo "⭐️ 1/8 Preparing .env for recording"
if [[ ! "${TEST_BACKEND:?}" =~ 'https://' ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

_env_file='./libs/sdk-ui-tests-e2e/.env'

cat > $_env_file <<-EOF
HOST=$TEST_BACKEND
CYPRESS_TEST_TAGS=pre-merge_isolated_tiger
FIXTURE_TYPE=goodsales
FILTER=${CYPRESS_RECORDED_TEST:-}
EOF

cat >> $_env_file <<-EOF
TIGER_API_TOKEN=${TIGER_API_TOKEN:?}
TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:?}
EOF

echo "⭐️ 1/8 Preparing .env for recording - Done"

function _docker_run(){
    docker run --entrypoint '' \
        -e USERID=$(id -u $USER) \
        -e HOST=$TEST_BACKEND \
        -e USER_NAME=$TEST_USER_NAME \
        -e PASSWORD=$TEST_USER_PASSWORD \
        -e AUTH_TOKEN=$TEST_PROJECT_TOKEN \
        -e FIXTURE_TYPE=goodsales \
        -e BUILD_URL=$BUILD_URL \
        -w /workspace/libs/sdk-ui-tests-e2e \
        -v $ROOT_DIR:/workspace \
        $CYPRESS_IMAGE $@
}

echo "⭐️ 2/8 Run rush install / build"
$_RUSH install
$_RUSH build -t sdk-ui-tests-e2e

echo "⭐️ 3/8 create reference workspace"
$_RUSHX libs/sdk-ui-tests-e2e create-ref-workspace

echo "⭐️ 4/8 build gooddata-ui-sdk-scenarios"
$_RUSHX libs/sdk-ui-tests-e2e build-scenarios

echo "⭐️ 5/8 build docker container from gooddata-ui-sdk-scenarios"
export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER}
trap "docker rmi --force $IMAGE_ID || true" EXIT
pushd $E2E_TEST_DIR
rm -rf ./recordings/mappings
mkdir -p ./recordings/mappings/TIGER
docker build --no-cache --file Dockerfile_local -t $IMAGE_ID . || exit 1

echo "⭐️ 6/8 Run isolated recording against TEST_BACKEND=$TEST_BACKEND."
export USER_UID=$(id -u $USER)
export USER_GID=$(id -g $USER)
PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER}
MODE=record NO_COLOR=1 docker-compose -f docker-compose-isolated.yaml -p "$PROJECT_NAME" up \
    --abort-on-container-exit --exit-code-from isolated-tests \
    --force-recreate --always-recreate-deps --renew-anon-volumes --no-color

echo "⭐️ 7/8 delete reference workspace on the host"
$_RUSHX libs/sdk-ui-tests-e2e delete-ref-workspace


echo "⭐️ 8/8 create file with test results that will be posted to pull request by the CI job"
_docker_run node scripts/create_github_report.js
