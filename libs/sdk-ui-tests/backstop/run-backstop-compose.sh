#!/bin/bash

# Absolute root dir .. for the docker volumes
ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))

export USER_UID=$(id -u)
export USER_GID=$(id -g)

cd $ROOT_DIR

# let "test" be the default command
# Collect all CLI args; default to "test" if none provided
if [ "$#" -gt 0 ]; then
    export COMMAND_ARGS="$*"
else
    export COMMAND_ARGS="test"
fi

docker-compose -f ./docker-compose-backstop.yaml  -p sdk-ui-tests-e2e-backstop-${BUILD_ID:-default} up --abort-on-container-exit --exit-code-from backstop --force-recreate --always-recreate-deps --renew-anon-volumes
