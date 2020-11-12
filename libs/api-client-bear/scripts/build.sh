#!/usr/bin/env bash

_clean() {
    rm -rf dist
    rm -rf esm
    rm -rf umd
}

_common-build() {
    echo
}

build() {
    _common-build
    concurrently "npm run build-cjs" "npm run build-esm" "npm run build-umd"
}

build-dev() {
    _clean
    _common-build
    tsc -p tsconfig.dev.json
}

build-dev-watch() {
    _common-build
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
