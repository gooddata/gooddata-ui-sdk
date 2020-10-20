#!/usr/bin/env bash

_build_styles() {
  echo
    # node-sass -q --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/css styles/scss/main.scss
}

_clean() {
    rm -rf dist
    rm -rf esm
}

_common-build() {
    _build_styles
}

build() {
    _common-build
    npm run build-esm
}

build-all() {
    _common-build
    concurrently "npm run build-cjs" "npm run build-esm" && npm run api-extractor
}

build-dev() {
    _clean
    _common-build
    tsc -p tsconfig.dev.json
}

build-dev-watch() {
    _common-build
    tsc --watch -p tsconfig.dev.json &
    _build_styles
}

FLAG=$1
if [ "$FLAG" = "--dev" ]; then
    build-dev
elif [ "$FLAG" = "--dev-watch" ]; then
    build-dev-watch
elif [ "$FLAG" = "--styles" ]; then
    _build_styles
elif [ "$FLAG" = "--all" ]; then
    build-all
else
    build
fi
