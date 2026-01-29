#!/usr/bin/env bash
set -e

_build_styles() {
    sass --load-path=node_modules styles/scss:styles/css
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