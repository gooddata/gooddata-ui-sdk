#!/bin/bash

setupGrunt () {
    export MODULES_HASH="$(echo -n "$(cat package.json) $(cat yarn.lock) $(node --version) $(yarn --version)" | md5sum | awk '{ print $1 }')"

    export MODULES_FILE="/tmp/node-modules-cache.${MODULES_HASH}.tar.gz"

    if [ -f ${MODULES_FILE} ]; then
        echo "Using node_modules cache..."
        tar xzf ${MODULES_FILE} ./
    else
        echo "Installing dependencies..."
        yarn install --pure-lockfile

        echo "Creating node_modules cache..."
        tar czf ${MODULES_FILE} ./node_modules/
        if [ $? -ne 0 ]; then
            rm ${MODULES_FILE}
        fi
    fi

    echo "Checking dependencies integrity..."
    yarn check --integrity

    export SETUP="1"
}

export PATH=$PATH:$WORKSPACE/node_modules/.bin

# initiate
if [ -z "$SETUP" ]; then
    setupGrunt
fi
