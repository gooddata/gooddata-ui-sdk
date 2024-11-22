#!/usr/bin/env bash
set -e


_version() {
    VERSION=$(node -p "require('./package.json').version")
    NAME=$(node -p "require('./package.json').name")
    DESCRIPTION=$(node -p "require('./package.json').description")
    sed -i.bak \
        -e "s|\0.\0.\0|$VERSION|" \
        -e "s|LIB_NAME_PLACEHOLDER|$NAME|" \
        -e "s|LIB_DESCRIPTION_PLACEHOLDER|$DESCRIPTION|" \
        esm/__version.js esm/__version.d.ts
    rm -f esm/*.bak
}

_post-build() {
    _version
}

_build_styles() {
    sass --load-path=node_modules styles/scss:styles/css
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
    tsc -p tsconfig.json
    _post-build
    npm run api-extractor
}

build
