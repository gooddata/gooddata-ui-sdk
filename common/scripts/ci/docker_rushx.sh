#!/bin/bash

# Absolute root directory - for volumes
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../.. && pwd -P))

IMAGE="node:12.15.0"

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

docker run \
  --env CI \
  --env WIREMOCK_NET \
  --env HOME="/workspace" \
  --rm \
  --net "${WIREMOCK_NET}" --net-alias tests \
  --volume ${ROOT_DIR}:/workspace:Z \
  -u $(id -u ${USER}):$(id -g ${USER}) \
  -w /workspace \
  ${IMAGE} \
  /bin/bash -c "cd ${PROJECT} && node \"../../common/scripts/install-run-rushx.js\" $*"
