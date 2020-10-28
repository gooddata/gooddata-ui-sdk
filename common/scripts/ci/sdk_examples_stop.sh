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
#
# destroy ${PUBLIC_APP_NAME} application
#
$_RUSH install
$_EXAMPLES heroku-destroy-app
