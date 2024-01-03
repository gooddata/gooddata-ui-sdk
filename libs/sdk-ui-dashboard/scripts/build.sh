#!/usr/bin/env bash

_version() {
    # prepare the auxiliary __version.ts file so that the code can read the package version as a constant
    echo '// (C) 2021 GoodData Corporation' >src/__version.ts
    echo '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD' >>src/__version.ts
    node -p "'export const LIB_VERSION = ' + JSON.stringify(require('./package.json').version) + ';'" >>src/__version.ts
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

    _version
}

build() {
    _common-build
    tsc -p tsconfig.json
    npm run api-extractor
}

build