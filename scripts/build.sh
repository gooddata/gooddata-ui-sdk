#!/usr/bin/env bash

_common-build(){
    rm -rf dist
    mkdir dist
    cp -rf src/translations/ dist/translations/
    node-sass --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/css styles/scss/main.scss
}

build(){
    _common-build
    tsc -p tsconfig.build.json
}

build-dev(){
    _common-build
    tsc -p tsconfig.dev.json
}

build-dev-watch(){
    _common-build
    tsc --watch -p tsconfig.dev.json & node-sass --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/css styles/scss/main.scss --watch
}


FLAG=$1
if [ "$FLAG" = "--dev" ]; then
    build-dev
elif [ "$FLAG" = "--dev-watch" ]; then
    build-dev-watch
else
    build
fi
