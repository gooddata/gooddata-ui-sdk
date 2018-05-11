#!/usr/bin/env bash

_build-sass(){
    node-sass --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/css styles/scss/main.scss
}

build(){
    rm -rf dist
    tsc
    cp -rf src/translations/ dist/translations/
    _build-sass
}

build-dev(){
    rm -rf dist
    tsc -p tsconfig.dev.json
    cp -rf src/translations/ dist/translations/
    _build-sass
}

build-dev-watch(){
    rm -rf dist
    mkdir dist
    cp -rf src/translations/ dist/translations/
    _build-sass

    tsc --watch -p tsconfig.dev.json
}


FLAG=$1
if [ "$FLAG" = "--dev" ]; then
    build-dev
elif [ "$FLAG" = "--dev-watch" ]; then
    build-dev-watch
else
    build
fi
