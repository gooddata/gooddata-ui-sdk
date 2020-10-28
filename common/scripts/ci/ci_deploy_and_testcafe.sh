#!/bin/bash

#
# This script builds and releases just the proxy to heroku. The proxy can be configured to work against any
# GD hostname / project - it is not limited to goodflights.
#

set -eu
set -o pipefail

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../.. && pwd -P))

_RUSH="${DIR}/docker_rush.sh"
_EXAMPLES="${DIR}/docker_examples.sh"
_TESTCAFE="${DIR}/docker_testcafe.sh"

#
# This will be picked up sdk-examples `build` and ensures the app is built appropriately. There is a hardcoded
# mapping between build-type -> host -> project
#
export EXAMPLES_BUILD_TYPE=${EXAMPLES_BUILD_TYPE:-"public"}
export EXAMPLE_MAPBOX_ACCESS_TOKEN=${MAPBOX_TOKEN}

$_RUSH install
$_RUSH build-all -t @gooddata/sdk-examples

#
# Create ${PUBLIC_APP_NAME} application
#
$_EXAMPLES heroku-create-app

#
# Build & push image using host's docker. Push when doing docker-in-docker fails on 'no basic auth provided' error
#
docker login --username="rail@gooddata.com" --password=${HEROKU_API_KEY} registry.heroku.com
cd examples/sdk-examples
docker build -t registry.heroku.com/${PUBLIC_APP_NAME}/web .
docker push registry.heroku.com/${PUBLIC_APP_NAME}/web
cd ../..

$_EXAMPLES heroku-set-env
$_EXAMPLES heroku-release

deploy_rc=$?

if [ $deploy_rc -ne 0 ]; then
  echo "Deployment failed"
else
  echo "Deployment successfull."
fi

$_TESTCAFE check-extended
