#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

$_RUSH install
$_RUSH build -t sdk-ui-tests
$_RUSHX libs/sdk-ui-tests build-storybook

LAST_COMMIT_HASH=$(git log -n1 --format="%h")
IMAGE_ID=harbor.intgdc.com/gooddata-ui-sdk/gooddata-ui-sdk-storybook

docker build --file ./libs/sdk-ui-tests/Dockerfile -t "${IMAGE_ID}:latest" -t "${IMAGE_ID}:${LAST_COMMIT_HASH}" ./libs/sdk-ui-tests || exit 1
docker push --all-tags "${IMAGE_ID}"
