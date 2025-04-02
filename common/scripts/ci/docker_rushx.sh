#!/bin/bash

# Absolute root directory - for volumes
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../.. && pwd -P))

# TODO: temporary fix - previous image was obtaining Node js version 18.19.0 which has some breaking changes on esm modules - https://github.com/nodejs/node/issues/51098
IMAGE="020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/node:22.13.0-bullseye"

echo "Running \"$*\" using ${IMAGE} in root directory ${ROOT_DIR}"

#
# Environment variables to propagate to docker
#
export CI=true

PROJECT="$1"
shift

echo "-----------------------------------------------------------------------"
echo "--- starting in project ${PROJECT}: $*"
echo "-----------------------------------------------------------------------"

#
# Execute `rushx` using dockerized node - all heavy lifting is done against SDK sources mounted as a volume onto the
# /workspace directory
#

if [ -z $WIREMOCK_NET ]; then
  net_param=""
else
  net_param="--net ${WIREMOCK_NET} --net-alias tests"
fi

docker run \
  --env CI \
  --env WIREMOCK_NET \
  --env EXAMPLES_BUILD_TYPE \
  --env NPM_PUBLISH_TOKEN \
  --env EXAMPLE_MAPBOX_ACCESS_TOKEN \
  --env BROWSERSLIST_IGNORE_OLD_DATA=true \
  --env HOME="/workspace" \
  --rm \
  ${net_param} \
  --volume ${ROOT_DIR}:/workspace:Z \
  -u $(id -u ${USER}):$(id -g ${USER}) \
  -w /workspace \
  ${IMAGE} \
  /bin/bash -c "cd ${PROJECT} && node \"../../common/scripts/install-run-rushx.js\" $*"
