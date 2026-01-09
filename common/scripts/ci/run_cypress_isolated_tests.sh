#!/bin/bash
set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e

pushd $E2E_TEST_DIR
cat > .env <<-EOF
HOST=dummy.gooddata.com
CYPRESS_TEST_TAGS=pre-merge_isolated_tiger_fe
FILTER=${FILTER:-}
EOF

(cd $ROOT_DIR/libs/sdk-ui-tests-e2e; npm run prepare-recording-workspace-id)
(cd $ROOT_DIR/libs/sdk-ui-tests-e2e; npm run build-scenarios)

# Use Dockerfile_local as scenarios have been build in previous steps
export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER}
trap "rm -f $E2E_TEST_DIR/.env; docker rmi --force $IMAGE_ID || true" EXIT

docker build --no-cache --file Dockerfile_local -t $IMAGE_ID . || exit 1

if [[ "$GITHUB_ACTIONS" != "true" ]]; then
    export USER_UID=$(id -u $USER)
    export USER_GID=$(id -g $USER)
fi

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER}

if [ -n "$GDC_UI" ]; then
  COMPOSE_FILE="docker-compose-isolated-gdcui.yaml"
else
  COMPOSE_FILE="docker-compose-isolated.yaml"
fi

NO_COLOR=1 docker compose -f $COMPOSE_FILE -p "$PROJECT_NAME" up \
  --abort-on-container-exit --exit-code-from isolated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes --no-color
