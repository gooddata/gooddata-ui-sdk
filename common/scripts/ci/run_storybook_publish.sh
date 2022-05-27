#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

$_RUSH install
$_RUSH build -t sdk-ui-tests
$_RUSHX libs/sdk-ui-tests build-storybook

LAST_COMMIT_HASH=$(git log -n1 --format="%h")
HARBOR_IMAGE_ID=harbor.intgdc.com/frontend/gooddata-ui-sdk-storybook
ECR_IMAGE_ID=020413372491.dkr.ecr.us-east-1.amazonaws.com/frontend/gooddata-ui-sdk-storybook

docker build --file ./libs/sdk-ui-tests/Dockerfile \
  -t "${HARBOR_IMAGE_ID}:latest" \
  -t "${HARBOR_IMAGE_ID}:${LAST_COMMIT_HASH}" \
  -t "${ECR_IMAGE_ID}:latest" \
  -t "${ECR_IMAGE_ID}:${LAST_COMMIT_HASH}" \
  ./libs/sdk-ui-tests || exit 1

docker push --all-tags "${HARBOR_IMAGE_ID}"
docker push --all-tags "${ECR_IMAGE_ID}"
