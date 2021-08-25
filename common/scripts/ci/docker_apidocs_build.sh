#!/bin/bash

# Absolute root directory - for volumes
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../.. && pwd -P))

# go one level up to "see" the gooddata-ui-apidocs too
ROOT_DIR="$ROOT_DIR/.."

IMAGE="node:14.17.5"

echo "Running apidocs build using ${IMAGE} in root directory ${ROOT_DIR}"

#
# Environment variables to propagate to docker
#
export CI=true


echo "-----------------------------------------------------------------------"
echo "--- starting: apidocs build"
echo "-----------------------------------------------------------------------"


if [ -z $API_DOCS_VERSION ]; then
  echo "You did not specify api docs version to create."
  exit 1
fi

#
# Execute apidocs build using dockerized node - all heavy lifting is done against SDK sources mounted as a volume onto the
# /workspace directory
#

docker run \
  --env CI \
  --env HOME="/workspace" \
  --env API_DOCS_VERSION="$API_DOCS_VERSION" \
  --rm \
  ${net_param} \
  --volume ${ROOT_DIR}:/workspace:Z \
  -u $(id -u ${USER}):$(id -g ${USER}) \
  -w /workspace \
  ${IMAGE} \
  /bin/bash -c "cd gooddata-ui-sdk && ./common/scripts/build-docs.js -v $API_DOCS_VERSION"
