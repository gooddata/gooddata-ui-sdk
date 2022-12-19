#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

pushd ./libs/sdk-ui-tests-e2e
cat > .env <<-EOF
SDK_BACKEND=BEAR
TEST_WORKSPACE_ID='c76e0537d0614abb0027f7c992656b964922506f'
HOST='https://staging3.intgdc.com'
CYPRESS_TEST_TAGS=pre-merge_isolated_bear
FILTER=${FILTER:-}
EOF


$_RUSH install
$_RUSH build -t sdk-ui-tests-e2e
$_RUSHX libs/sdk-ui-tests-e2e build-scenarios

# Use Dockerfile_local as scenarios have been build in previous steps
docker build --file Dockerfile_local -t gooddata-ui-sdk-scenarios . || exit 1

NO_COLOR=1 IMAGE_ID=gooddata-ui-sdk-scenarios docker-compose -f docker-compose-isolated.yaml up --abort-on-container-exit --exit-code-from isolated-tests --force-recreate --always-recreate-deps --renew-anon-volumes --no-color

rm -f .env
