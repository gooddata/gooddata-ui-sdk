#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

sdk_backend=$(tr <<< $SDK_BACKEND '[:upper:]' '[:lower:]')

pushd $E2E_TEST_DIR
cat > .env <<-EOF
SDK_BACKEND=${SDK_BACKEND:-BEAR}
HOST=${TEST_BACKEND:-}
CYPRESS_TEST_TAGS=post-merge_integrated_${sdk_backend}
FILTER=${FILTER:-}
TIGER_API_TOKEN=${TIGER_API_TOKEN:-}
TIGER_DATASOURCES_NAME=vertica_staging-goodsales
EOF

$_RUSH install
$_RUSH build -t sdk-ui-tests-e2e
$_RUSHX libs/sdk-ui-tests-e2e create-ref-workspace

$_RUSHX libs/sdk-ui-tests-e2e build-scenarios

export IMAGE_ID=${sdk_backend}-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER}
trap "$_RUSHX libs/sdk-ui-tests-e2e delete-ref-workspace; rm -f $E2E_TEST_DIR/.env; docker rmi --force $IMAGE_ID || true" EXIT

# Use Dockerfile_local as scenarios have been build in previous steps
docker build --no-cache --file Dockerfile_local -t $IMAGE_ID . || exit 1

NO_COLOR=1 docker-compose -f docker-compose-integrated.yaml up \
  --abort-on-container-exit --exit-code-from integrated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes --no-color

$_RUSHX libs/sdk-ui-tests-e2e delete-ref-workspace
