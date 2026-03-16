#!/bin/bash -i
set -ex

: "${HOST:?}"
: "${SDK_VERSION:?}"

export BOILER_APP_NAME=new-boiler-app-$SDK_LANG
export BOILER_APP_VERSION=app-toolkit@$SDK_VERSION
export BOILER_APP_HOST=https://127.0.0.1:3000
PLAYWRIGHT_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/mcr.microsoft.com/playwright:v1.58.2-noble'

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e

if [ -n "$GDC_UI" ]; then
  echo "GDC_UI is set"
  RUSH_REPO_ROOT="../../.."
  RESOLVED_ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../../ && pwd -P))
  DOCKER_CURRENT_DIR="/workspace/sdk/libs/sdk-ui-tests-e2e"
  DOCKER_SCRIPT_PATH="/workspace/sdk/common/scripts/ci/run_boiler_app_integrated.sh"
else
  echo "GDC_UI is not set"
  RUSH_REPO_ROOT="../.."
  RESOLVED_ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
  DOCKER_CURRENT_DIR="/workspace/libs/sdk-ui-tests-e2e"
  DOCKER_SCRIPT_PATH="/workspace/libs/sdk-ui-tests-e2e/scripts/run_boiler_app_integrated.sh"
  #in gooddata-ui-sdk we use original dockerized rush
  _RUSH="${DIR}/docker_rush.sh"
  _RUSHX="${DIR}/docker_rushx.sh"
fi



if [[ ! "${HOST:?}" =~ https?:// ]]; then
    export HOST="https://${HOST}"
fi

pushd $E2E_TEST_DIR
cat > .env <<-EOF
HOST=${HOST:-}
PLAYWRIGHT_GREP=@checklist_integrated_boiler_tiger
FIXTURE_TYPE=${FIXTURE_TYPE:-}
FILTER=${FILTER:-}
TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:-}
EOF

if [ -n "$GDC_UI" ]; then
    (cd $ROOT_DIR/libs/sdk-ui-tests-e2e && node $RUSH_REPO_ROOT/common/scripts/install-run-rush.js install)
    (cd $ROOT_DIR/libs/sdk-ui-tests-e2e && node $RUSH_REPO_ROOT/common/scripts/install-run-rush.js build -t sdk-ui-tests-e2e -t @gooddata/app-toolkit)
else
    $_RUSH install
    $_RUSH build -t sdk-ui-tests-e2e -t @gooddata/app-toolkit
fi

trap "docker rmi --force $PLAYWRIGHT_IMAGE || true" EXIT

# Run everything inside the Playwright container
docker run --rm --entrypoint '' \
--user root \
-e BOILER_APP_NAME \
-e BOILER_APP_VERSION \
-e SDK_LANG \
-e BOILER_APP_HOST \
-e HOST \
-e TIGER_API_TOKEN \
-e AUTH_TOKEN \
-e FIXTURE_TYPE \
-e TIGER_DATASOURCES_NAME \
-e FILTER \
-v $RESOLVED_ROOT_DIR:/workspace \
-w $DOCKER_CURRENT_DIR $PLAYWRIGHT_IMAGE \
bash $DOCKER_SCRIPT_PATH || exit 1
