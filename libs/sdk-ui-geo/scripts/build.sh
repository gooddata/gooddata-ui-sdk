#!/usr/bin/env bash

_build_styles() {
    node-sass -q --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/css styles/scss/main.scss

    # copy styles to dist to preserve relative import from GeoChartOptionsWrapper
    # there is no reasonable way to do this with TypeScript, see https://github.com/microsoft/TypeScript/issues/10866
    # we also need to keep them in root as we are referencing that place from documentation
    # (for customer imports of the styles without the /dist/)
    mkdir -p dist/styles
    cp -r styles/ dist/styles/
}

_clean() {
    rm -rf dist
    rm -rf styles/css
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
    _build_styles
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
