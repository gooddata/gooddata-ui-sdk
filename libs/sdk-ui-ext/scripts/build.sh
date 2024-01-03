#!/usr/bin/env bash

_build_styles() {
    sass --load-path=node_modules styles/internal/scss:styles/internal/css
    sass --load-path=node_modules styles/scss:styles/css
}

_assets() {
    mkdir -p esm/internal
    # first copy everything in the assets (in case there are non-SVG files)
    cp -rf src/internal/assets esm/internal/
    # then use svgo to optimize all the SVGs there
    svgo -rqf src/internal/assets esm/internal/assets
}

_common-build() {
    _assets

    _build_styles
}

build() {
    _common-build

    tsc -p tsconfig.json
    npm run api-extractor
}

build
