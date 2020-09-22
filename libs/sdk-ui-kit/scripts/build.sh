#!/usr/bin/env bash

_build_styles() {
    node-sass -q --importer node_modules/node-sass-magic-importer/dist/cli.js styles/scss -o styles/css
    node-sass -q --importer node_modules/node-sass-magic-importer/dist/cli.js src/**/styles/ -o styles/css
}

_build_styles_watch() {
    node-sass --importer node_modules/node-sass-magic-importer/dist/cli.js styles/scss -o styles/css
    node-sass -wr --importer node_modules/node-sass-magic-importer/dist/cli.js src/**/styles/ -o styles/css
}

_clean() {
    rm -rf dist
    rm -rf styles/css
}

_common-build() {
    mkdir dist

    _build_styles
}

build() {
    _clean
    _common-build
    tsc -p tsconfig.build.json
}

build-dev() {
    _clean
    _common-build
    tsc -p tsconfig.dev.json
}

build-dev-watch() {
    _common-build
    tsc --watch -p tsconfig.dev.json &
    _build_styles_watch
}

FLAG=$1
if [ "$FLAG" = "--dev" ]; then
    build-dev
elif [ "$FLAG" = "--dev-watch" ]; then
    build-dev-watch
else
    build
fi
