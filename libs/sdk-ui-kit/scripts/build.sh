#!/usr/bin/env bash
set -e

_build_styles() {
    sass --load-path=node_modules --load-path=node_modules/fixed-data-table-2/dist styles/scss:styles/css
}

_assets() {
    mkdir -p esm
    # first copy everything in the assets (in case there are non-SVG files)
    cp -rf src/assets esm/
    # then use svgo to optimize all the SVGs there
    svgo -rqf src/assets esm/assets
}

_common-build() {
    _assets

    _build_styles
}

build() {
    _common-build

    npm-run-all -p build-check build-ts
    npm run api-extractor
}

build
