#!/usr/bin/env bash

_clean() {
    rm -rf dist
    rm -rf umd
}

_common-build() {
    # copy package.json to dis, xhr.ts depends on it using ../package.json
    mkdir -p dist
    cp package.json dist
}

build() {
    _common-build
    npm run build-esm
}

build-all() {
    _clean
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
elif [ "$FLAG" = "--all" ]; then
    build-all
else
    build
fi
