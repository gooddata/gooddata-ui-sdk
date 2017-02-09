#!/bin/bash

setupGrunt () {
    echo "Installing Grunt and dependencies..."

    export MODULES_HASH="$(echo -n "$(cat package.json) $(node --version) $(yarn --version)" | md5sum | awk '{ print $1 }')"
    export MODULES_FILE="/tmp/node-modules-cache.${MODULES_HASH}.tar.gz"

    if [ -f ${MODULES_FILE} ]; then
        tar xzf ${MODULES_FILE} ./
    else
        yarn install
        tar czf ${MODULES_FILE} ./node_modules/
        if [ $? -ne 0 ]; then
            rm ${MODULES_FILE}
        fi
    fi

    # install dependencies
    bower install

    export SETUP="1"
}

export PATH=$PATH:$WORKSPACE/node_modules/.bin

# initiate
if [ -z "$SETUP" ]; then
    setupGrunt
fi
