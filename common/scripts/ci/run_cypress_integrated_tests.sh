#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

sdk_backend=$(tr <<< "${SDK_BACKEND:?}" '[:upper:]' '[:lower:]')

if [[ ! "${TEST_BACKEND:?}" =~ https?:// ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

export TEST_BACKEND_NO_PREFIX=$(sed <<< $TEST_BACKEND -E "s#^https?:\/\/##")

pushd $E2E_TEST_DIR
cat > .env <<-EOF
SDK_BACKEND=${SDK_BACKEND:-BEAR}
HOST=${TEST_BACKEND:-}
CYPRESS_TEST_TAGS=post-merge_integrated_${sdk_backend}
FIXTURE_TYPE=goodsales
FILTER=${FILTER:-}
EOF

if [[ "$SDK_BACKEND" == 'BEAR' ]]; then
    cat >> .env <<-EOF
USER_NAME=${USER_NAME:?}
PASSWORD=${PASSWORD:?}
AUTH_TOKEN=${AUTH_TOKEN:?}
EOF

elif [[ "$SDK_BACKEND" == 'TIGER' ]]; then
    cat >> .env <<-EOF
TIGER_API_TOKEN=${TIGER_API_TOKEN:?}
TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:?}
EOF
else
    echo "Unknown SDK_BACKEND=${SDK_BACKEND}. Exiting..."
    exit 1
fi

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
