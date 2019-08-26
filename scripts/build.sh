#!/usr/bin/env bash

_build_styles(){
    node-sass --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/css styles/scss
    node-sass --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/internal/css styles/internal/scss
}

_common-build(){
    rm -rf dist

    mkdir dist
    cp -rf src/translations/ dist/translations/

    mkdir dist/internal
    cp -rf src/internal/assets dist/internal/
    cp -rf src/internal/translations dist/internal/

    _build_styles
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
    tsc --watch -p tsconfig.dev.json & _build_styles
}


FLAG=$1
if [ "$FLAG" = "--dev" ]; then
    build-dev
elif [ "$FLAG" = "--dev-watch" ]; then
    build-dev-watch
else
    build
fi
