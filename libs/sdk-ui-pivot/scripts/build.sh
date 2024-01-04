#!/usr/bin/env bash

_build_styles() {
    # --quiet-deps avoid ag-grid deprecation warnings
    sass --quiet-deps --load-path=node_modules --load-path=node_modules/fixed-data-table-2/dist styles/scss:styles/css
}

_common-build() {
    _build_styles
}

build() {
    _common-build

    tsc -p tsconfig.json
    npm run api-extractor
}

build
