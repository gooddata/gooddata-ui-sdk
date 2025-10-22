#!/bin/bash

# Absolute root dir .. for the docker volumes
ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))

export USER_UID=$(id -u)
export USER_GID=$(id -g)

cd $ROOT_DIR

# copy storybook to serve app dir
cp -r ./dist-storybook ./neobackstop/serve/dist-storybook

# let "test" be the default command
# Collect all CLI args; default to "test" if none provided
if [ "$#" -gt 0 ]; then
    export COMMAND_ARGS="$*"
else
    export COMMAND_ARGS="test"
fi

# Convert CLI flags "--flag value" to "--flag=value" for Go app
# Simple conversion: replace space after flag with =
COMMAND_ARGS=$(echo $COMMAND_ARGS | sed -E 's/--([a-zA-Z0-9_-]+) ([^ ]+)/--\1=\2/g')

#--exit-code-from backstop
docker-compose -f ./docker-compose-neobackstop.yaml -p sdk-ui-tests-e2e-backstop-${BUILD_ID:-default} up --abort-on-container-exit --force-recreate --always-recreate-deps --renew-anon-volumes
