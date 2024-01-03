#!/usr/bin/env bash

_build_styles() {
    sass --load-path=node_modules --load-path=node_modules/mapbox-gl/dist styles/scss/main.scss:styles/css/main.css
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
