#!/bin/bash

setupGrunt () {
    # this should really be a dependency of the client
    npm install grunt-cli
    npm install bower

    # install dependencies
    npm install
    bower install
}

export PATH=$PATH:$WORKSPACE/node_modules/.bin
