#!/bin/bash

set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

if [[ ! "${TEST_BACKEND:?}" =~ https?:// ]]; then
    export TEST_BACKEND="https://${TEST_BACKEND}"
fi

export TEST_BACKEND_NO_PREFIX=$(sed <<< $TEST_BACKEND -E "s#^https?:\/\/##")

if [[ $RUN_ON_GH != "true" ]]; then
pushd $E2E_TEST_DIR
cat > .env <<-EOF
HOST=${TEST_BACKEND:-}
CYPRESS_TEST_TAGS=post-merge_integrated_tiger
FIXTURE_TYPE=goodsales
FILTER=${FILTER:-}
EOF

cat >> .env <<-EOF
TIGER_API_TOKEN=${TIGER_API_TOKEN:?}
TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:?}
EOF
else
    export HOST=${TEST_BACKEND}
    export TEST_BACKEND=${TEST_BACKEND:-}
    export CYPRESS_TEST_TAGS=post-merge_integrated_tiger
    export FIXTURE_TYPE=goodsales
    export FILTER=${FILTER:-}
    export TIGER_API_TOKEN=${TIGER_API_TOKEN:?}
    export TIGER_DATASOURCES_NAME=${TIGER_DATASOURCES_NAME:?}
fi

if [[ $RUN_ON_GH != "true" ]]; then
    $_RUSH install
    $_RUSH build -t sdk-ui-tests-e2e
    $_RUSHX libs/sdk-ui-tests-e2e create-ref-workspace
    WORKSPACE_CREATED=true
    DELETE_MODE="${DELETE_MODE:-delete_always}"

    $_RUSHX libs/sdk-ui-tests-e2e build-scenarios
else
    (cd libs/sdk-ui-tests-e2e && node ../../common/scripts/install-run-rushx.js create-ref-workspace)
    WORKSPACE_CREATED=true
    DELETE_MODE="${DELETE_MODE:-delete_always}"
    (cd libs/sdk-ui-tests-e2e && node ../../common/scripts/install-run-rushx.js build-scenarios)
fi
export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER:-default}

cleanup() {
    echo "Executing cleanup before exiting..."
    # remove previously created workspace
    if [ -n "$WORKSPACE_CREATED" ]; then
      if [ $DELETE_MODE = "delete_never" ]; then
        echo "DELETE_MODE is delete_never, skip deleting the created workspace"
      else
        if [[ $RUN_ON_GH != "true" ]]; then
          $_RUSHX libs/sdk-ui-tests-e2e delete-ref-workspace
        else
          (node $ROOT_DIR/common/scripts/install-run-rushx.js delete-ref-workspace)
        fi
      fi
    fi
    rm -f $E2E_TEST_DIR/.env
    docker rmi --force $IMAGE_ID || true
}

trap cleanup EXIT

if [[ $RUN_ON_GH == "true" ]]; then
    pushd $E2E_TEST_DIR
fi

# Use Dockerfile_local as scenarios have been build in previous steps
docker build --no-cache --file Dockerfile_local -t $IMAGE_ID . || exit 1

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER:-default}
NO_COLOR=1 docker-compose -f docker-compose-integrated.yaml -p "$PROJECT_NAME" up \
  --abort-on-container-exit --exit-code-from integrated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes --no-color
