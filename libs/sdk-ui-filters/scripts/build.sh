#!/usr/bin/env bash
set -e

_build_styles() {
    sass --load-path=node_modules --load-path=node_modules/fixed-data-table-2/dist styles/scss:styles/css
}

_common-build() {
    _build_styles
}

build() {
    _common-build

    npm-run-all -p build-check build-ts
    npm run api-extractor
}

build
