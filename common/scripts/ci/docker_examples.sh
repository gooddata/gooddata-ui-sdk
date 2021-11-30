#!/bin/bash
set -eu
set -o pipefail

# Absolute root directory - for volumes
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../.. && pwd -P))

IMAGE="node:16.13.0"

echo "Running \"$*\" using ${IMAGE} in root directory ${ROOT_DIR}"

echo "-----------------------------------------------------------------------"
echo "--- starting: heroku-cli (via examples package.json scripts) $*"
echo "-----------------------------------------------------------------------"

#
# Do work against heroku, by triggering package.json scripts which then start heroku CLI
#

_BACKEND_URL="https://${BACKEND_HOST}"
DEPLOY_USERID=1000
DEPLOY_GROUPID=$(cut -d: -f3 < <(getent group docker))

echo "Going to deploy examples to heroku. Deployment details:"
echo "  Application name:  ${PUBLIC_APP_NAME}"
echo "  Backend   :        ${BACKEND_HOST}"

docker run \
  --env HEROKU_API_KEY=${HEROKU_API_KEY} \
  --env PUBLIC_APP_NAME=${PUBLIC_APP_NAME} \
  --env BACKEND_URL=${_BACKEND_URL} \
  --env BACKEND_HOST=${BACKEND_HOST} \
  --env HOME="/home/node" \
  --volume ${ROOT_DIR}:/workspace:rw,z,delegated \
  -u ${DEPLOY_USERID}:${DEPLOY_GROUPID} \
  -w /workspace \
  ${IMAGE} \
  /bin/bash -c "cd examples/sdk-examples && npm run $*"
