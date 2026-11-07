#!/bin/bash -i
set -ex

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

NODE_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/node:22.13.0-bullseye'
CYPRESS_HOST=$HOST
TIGER_API_TOKEN=$TIGER_API_TOKEN
FIXTURE_TYPE=$FIXTURE_TYPE
TIGER_DATASOURCES_NAME=$TIGER_DATASOURCES_NAME

$_RUSH install
$_RUSH build -t sdk-backend-tiger

pushd "${ROOT_DIR}" || exit 1

docker run --rm --entrypoint '' \
-e HOST=$CYPRESS_HOST \
-e TIGER_API_TOKEN=$TIGER_API_TOKEN \
-e FIXTURE_TYPE=$FIXTURE_TYPE \
-e TIGER_DATASOURCES_NAME=$TIGER_DATASOURCES_NAME \
-w /workspace/libs/sdk-backend-tiger -v "$(pwd)":/workspace $NODE_IMAGE \
sh -c "./scripts/run-integrated-with-workspace.sh" || exit 1
