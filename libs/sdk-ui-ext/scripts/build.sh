#!/usr/bin/env bash

_build_styles() {
    sass --load-path=node_modules styles/internal/scss:styles/internal/css
    sass --load-path=node_modules styles/scss:styles/css
}

_clean() {
    rm -rf esm
    rm -rf styles/internal/css
    rm -rf styles/css
}

_common-build() {
    mkdir -p esm/internal
    # first copy everything in the assets (in case there are non-SVG files)
    cp -rf src/internal/assets esm/internal/
    # then use svgo to optimize all the SVGs there
    svgo -rqf src/internal/assets esm/internal/assets
    cp -rf src/internal/translations esm/internal/

    _build_styles
}

build() {
    _common-build
    npm run build-esm && npm run api-extractor
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
