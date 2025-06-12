#!/bin/bash -i
set -ex

: "${HOST:?}"
: "${SDK_VERSION:?}"

export BOILER_APP_NAME=new-boiler-app-$SDK_LANG
export BOILER_APP_VERSION=app-toolkit@$SDK_VERSION
export BOILER_APP_HOST=https://127.0.0.1:8080
CYPRESS_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/cypress/included:13.17.0'

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

if [[ ! "${HOST:?}" =~ https?:// ]]; then
    export HOST="https://${HOST}"
fi

pushd $E2E_TEST_DIR
cat > .env <<-EOF
HOST=${HOST:-}
CYPRESS_TEST_TAGS=checklist_integrated_boiler_tiger
FIXTURE_TYPE=${FIXTURE_TYPE:-}
FILTER=${FILTER:-}
TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:-}
EOF

$_RUSH install
$_RUSH build -t sdk-ui-tests-e2e
trap "docker rmi --force $CYPRESS_IMAGE || true" EXIT

docker run --rm --entrypoint '' \
--user root \
-e BOILER_APP_NAME \
-e BOILER_APP_VERSION \
-e SDK_LANG \
-e BOILER_APP_HOST \
-e VISUAL_MODE=false \
-e HOST \
-e TIGER_API_TOKEN \
-e AUTH_TOKEN \
-w /workspace/libs/sdk-ui-tests-e2e -v $ROOT_DIR:/workspace $CYPRESS_IMAGE \
sh -c "./scripts/run_boiler_app.sh" || exit 1
