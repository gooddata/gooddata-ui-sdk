#!/usr/bin/env bash

_build_styles() {
    echo
}

_clean() {
    rm -rf esm
}

_common-build() {
    _build_styles
}

build() {
    _common-build
    npm run build-esm
}

build-dev() {
    _clean
    _common-build
    tsc -p tsconfig.dev.json
}

build-dev-watch() {
    _common-build
    tsc --watch -p tsconfig.dev.json
    _build_styles
}

FLAG=$1
if [ "$FLAG" = "--dev" ]; then
    build-dev
elif [ "$FLAG" = "--dev-watch" ]; then
    build-dev-watch
elif [ "$FLAG" = "--styles" ]; then
    _build_styles
else
    build
fi
