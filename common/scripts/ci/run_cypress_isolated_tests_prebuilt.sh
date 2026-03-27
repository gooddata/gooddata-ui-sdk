#!/bin/bash
set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
APP_DIR=$ROOT_DIR/libs/sdk-ui-tests-app
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e
REF_WS_DIR=$ROOT_DIR/libs/sdk-ui-tests-reference-workspace

# Export WORKSPACE_ID for the app container (injected at container runtime via entrypoint)
export WORKSPACE_ID=$(jq -r '.workspaceId' $REF_WS_DIR/recordings_workspace.json)

# Write .env for the e2e tests
pushd $E2E_TEST_DIR
cat > .env <<-EOF
HOST=dummy.gooddata.com
FILTER=${FILTER:-}
EOF

if [ -n "$IMAGE_URL" ]; then
    echo "Using pre-built app image: $IMAGE_URL"
else
    export IMAGE_URL=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER}
    trap "rm -f $E2E_TEST_DIR/.env; docker rmi --force $IMAGE_URL || true" EXIT
    docker build --no-cache -t $IMAGE_URL $APP_DIR || exit 1
fi

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER}

if [ -n "$GDC_UI" ]; then
  COMPOSE_FILE="docker-compose-isolated-gdcui.yaml"
else
  COMPOSE_FILE="docker-compose-isolated.yaml"
fi

NO_BUILD=""
if [ -n "$E2E_IMAGE_URL" ]; then
    NO_BUILD="--no-build"
fi

NO_COLOR=1 docker compose -f $COMPOSE_FILE -p "$PROJECT_NAME" up $NO_BUILD \
  --abort-on-container-exit --exit-code-from isolated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes --no-color
