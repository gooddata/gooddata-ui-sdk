#!/usr/bin/env bash

_build_styles() {
    node-sass -q --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/css styles/scss
}

_clean() {
    rm -rf dist
    rm -rf esm
    rm -rf styles/css
}

_common-build() {
    mkdir -p dist
    # first copy everything in the assets (in case there are non-SVG files)
    cp -rf src/assets dist/
    # then use svgo to optimize all the SVGs there
    svgo -rqf src/assets dist/assets

    mkdir -p esm
    # copy optimized assets from dist, no need to run the optimization again
    cp -rf dist/assets esm

    _build_styles

    mkdir -p dist/localization/bundles
    cp -rf src/localization/bundles dist/localization

    mkdir -p esm/localization/bundles
    cp -rf src/localization/bundles esm/localization
}

build() {
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

build-styles() {
    rm -rf styles/css
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
