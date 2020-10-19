#!/usr/bin/env bash

_build_styles() {
    echo

    # copy styles to dist to preserve relative import from GeoChartOptionsWrapper
    # there is no reasonable way to do this with TypeScript, see https://github.com/microsoft/TypeScript/issues/10866
    # we also need to keep them in root as we are referencing that place from documentation
    # (for customer imports of the styles without the /dist/)
    # UNCOMMENT THIS ONCE YOU HAVE SOME STYLES BUILDING
    # mkdir -p dist/styles
    # cp -r styles/ dist/styles/
}

_clean() {
    rm -rf dist
}

_common-build() {
    mkdir dist

    _build_styles
}

build() {
    _common-build
    npm run build-esm && npm run api-extractor
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
