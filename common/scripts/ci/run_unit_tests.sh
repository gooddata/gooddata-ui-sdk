#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

$_RUSH install
$_RUSH build
$_RUSH validate-ci

#
# Explicitly limiting parallelism during tests; this is because Jest already does parallel test execution on
# per-project basis.
#
$_RUSH test-ci --parallelism 4
