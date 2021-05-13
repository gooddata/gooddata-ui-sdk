#!/usr/bin/env bash

_build_styles() {
    node-sass -q --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/internal/css styles/internal/scss
    node-sass -q --importer node_modules/node-sass-magic-importer/dist/cli.js -o styles/css styles/scss
}

_clean() {
    rm -rf dist
    rm -rf esm
    rm -rf styles/internal/css
    rm -rf styles/css
}

_common-build() {
    mkdir -p dist/internal
    # first copy everything in the assets (in case there are non-SVG files)
    cp -rf src/internal/assets dist/internal/
    # then use svgo to optimize all the SVGs there
    svgo -rqf src/internal/assets dist/internal/assets
    cp -rf src/internal/translations dist/internal/

    mkdir -p esm/internal
    # copy optimized assets from dist, no need to run the optimization again
    cp -rf dist/internal/assets esm/internal/
    cp -rf src/internal/translations esm/internal/

    _build_styles
}

build() {
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
    _build_styles
    tsc --watch -p tsconfig.dev.json
}

build-styles() {
    rm -rf styles/internal/css
    rm -rf styles/css
    _build_styles
}

FLAG=$1
if [ "$FLAG" = "--dev" ]; then
    build-dev
elif [ "$FLAG" = "--dev-watch" ]; then
    build-dev-watch
elif [ "$FLAG" = "--styles" ]; then
    build-styles
else
    build
fi
