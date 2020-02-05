#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

$_RUSH install
$_RUSH build
$_RUSH validate-ci
$_RUSH test-ci
