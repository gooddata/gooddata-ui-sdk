#!/bin/bash

ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))
cd $ROOT_DIR

if [[ -z $CI ]]; then
    # when run locally, attach current user to the run
    USER_UID=$(id -u)
    USER_GID=$(id -g)
fi

echo "Running with $USER_UID, $USER_GID"

if [[ $GD_TIGER_REC == "true" ]]; then
    echo "Running isolated record"
    TIGER_API_TOKEN=$TIGER_API_TOKEN USER_UID=$USER_UID USER_GID=$USER_GID docker compose -f ./docker-compose-isolated-record.yaml up --quiet-pull --abort-on-container-exit --exit-code-from isolated-tests --force-recreate --always-recreate-deps --renew-anon-volumes
else
    echo "Running isolated"
    USER_UID=$USER_UID USER_GID=$USER_GID docker compose -f ./docker-compose-isolated.yaml up --quiet-pull --force-recreate --exit-code-from isolated-tests --always-recreate-deps --renew-anon-volumes
fi
