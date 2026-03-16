#!/bin/bash
set -e

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
APP_DIR=$ROOT_DIR/libs/sdk-ui-tests-app
E2E_TEST_DIR=$ROOT_DIR/libs/sdk-ui-tests-e2e
REF_WS_DIR=$ROOT_DIR/libs/sdk-ui-tests-reference-workspace

# Inject runtime config (WORKSPACE_ID) into the pre-built dist and pack
WORKSPACE_ID=$(jq -r '.workspaceId' $REF_WS_DIR/recordings_workspace.json)
(cd $APP_DIR; ./scripts/inject-runtime-config.sh "$WORKSPACE_ID" && npm run pack-build)

# Write .env for the e2e tests
pushd $E2E_TEST_DIR
cat > .env <<-EOF
HOST=dummy.gooddata.com
FILTER=${FILTER:-}
EOF

# Build docker image from the app package
export IMAGE_ID=tiger-gooddata-ui-sdk-scenarios-${EXECUTOR_NUMBER}
trap "rm -f $E2E_TEST_DIR/.env; docker rmi --force $IMAGE_ID || true" EXIT

docker build --no-cache -t $IMAGE_ID $APP_DIR || exit 1

PROJECT_NAME=tiger-sdk-ui-tests-e2e-${EXECUTOR_NUMBER}

if [ -n "$GDC_UI" ]; then
  COMPOSE_FILE="docker-compose-isolated-gdcui.yaml"
else
  COMPOSE_FILE="docker-compose-isolated.yaml"
fi

NO_COLOR=1 docker compose -f $COMPOSE_FILE -p "$PROJECT_NAME" up \
  --abort-on-container-exit --exit-code-from isolated-tests \
  --force-recreate --always-recreate-deps --renew-anon-volumes --no-color
