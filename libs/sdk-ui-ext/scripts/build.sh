#!/usr/bin/env bash

_build_styles() {
    node-sass -q --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/internal/css styles/internal/scss
}

_clean() {
    rm -rf dist
    rm -rf styles/css
}

_common-build() {
    mkdir -p dist/cjs/internal
    mkdir -p dist/esm/internal
    cp -rf src/internal/assets dist/cjs/internal/
    cp -rf src/internal/translations dist/cjs/internal/
    cp -rf src/internal/assets dist/esm/internal/
    cp -rf src/internal/translations dist/esm/internal/

    _build_styles
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
    _build_styles
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
