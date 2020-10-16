#!/usr/bin/env bash

_clean() {
    rm -rf dist
    rm -rf styles/css
}

_common-build() {
    mkdir -p dist/cjs/base/localization/bundles
    mkdir -p dist/esm/base/localization/bundles

    cp -rf src/base/localization/bundles dist/cjs/base/localization
    cp -rf src/base/localization/bundles dist/esm/base/localization
}

build() {
    _common-build
    npm run build-esm
}

build-all() {
    _common-build
    concurrently "npm run build-cjs" "npm run build-esm"
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
