#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

$_RUSH install
$_RUSH build -t dashboard-plugin-tests

docker build --file ./tools/dashboard-plugin-tests/Dockerfile -t gooddata-dashboard-plugin-tests . || exit 1

NO_COLOR=1 IMAGE_ID=gooddata-dashboard-plugin-tests docker-compose -f ./tools/dashboard-plugin-tests/docker-compose-isolated.yaml up --abort-on-container-exit --exit-code-from isolated-tests --force-recreate --always-recreate-deps --renew-anon-volumes --no-color
