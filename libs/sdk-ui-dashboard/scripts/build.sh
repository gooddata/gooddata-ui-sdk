#!/usr/bin/env bash

_build_styles() {
    sass --load-path=node_modules styles/scss:styles/css
    postcss --config postcss.config.js -d styles/css-inlined styles/css/*.css
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

    mkdir -p dist/presentation/localization/bundles
    cp -rf src/presentation/localization/bundles dist/presentation/localization

    mkdir -p esm/presentation/localization/bundles
    cp -rf src/presentation/localization/bundles esm/presentation/localization

    # prepare the auxiliary __version.ts file so that the code can read the package version as a constant
    echo '// (C) 2021 GoodData Corporation' >src/__version.ts
    echo '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD' >>src/__version.ts
    node -p "'export const LIB_VERSION = ' + JSON.stringify(require('./package.json').version) + ';'" >>src/__version.ts
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
    rm -rf styles/css-inlined
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
