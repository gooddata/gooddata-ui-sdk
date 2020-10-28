#!/bin/bash
set -eu
set -o pipefail

# Absolute root directory - for volumes
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../.. && pwd -P))

IMAGE="harbor.intgdc.com/tools/gdc-node-chrome:8.12.0_67.0.3396"

echo "Running \"$*\" using ${IMAGE} in root directory ${ROOT_DIR}"

echo "-----------------------------------------------------------------------"
echo "--- starting: testcafe-cli (via check-extended package.json scripts) $*"
echo "-----------------------------------------------------------------------"

#
# Do work against heroku, by triggering package.json scripts which then start heroku CLI
#

_BACKEND_URL="https://${BACKEND_HOST}"
USERID=${HOST_USERID:=$(id -u ${USER})}
GROUPID=${HOST_GROUPID:=$(id -g ${USER})}

echo "Going to deploy examples to heroku. Deployment details:"
echo "  Application name:  ${PUBLIC_APP_NAME}"
echo "  Backend   :        ${BACKEND_HOST}"
docker pull ${IMAGE}
docker run \
  --env PUBLIC_APP_NAME=${PUBLIC_APP_NAME} \
  --env PUBLIC_APP_URL="https://${PUBLIC_APP_NAME}.herokuapp.com" \
  --env HOME="/home/node" \
  --volume ${ROOT_DIR}:/workspace:rw,z,delegated \
  -u ${USERID}:${GROUPID} \
  -w /workspace \
  -i ${IMAGE} xvfb-run \
  -a -s "-screen 0 1680x1050x24 -noreset" \
  /bin/bash -c "cd examples/sdk-examples && npm run $*" \
  || true
# prove returns non-zero status code if tests fails
# ignore the status and let the junit publisher mark the build unstable instead
