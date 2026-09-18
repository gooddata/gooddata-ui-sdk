#!/usr/bin/env bash
set -e

_build_styles() {
    sass --load-path=node_modules --load-path=node_modules/mapbox-gl/dist styles/scss/main.scss:styles/css/main.css
}

_build_worker() {
    # maplibre-gl 6 does not inline its web worker and resolves it through import.meta.url, which
    # does not survive bundling. Bundle the worker and its shared chunk into one self-contained file
    # that bundlers emit as an asset. See src/next/map/runtime/mapWorker.ts.
    mkdir -p worker
    rolldown node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs \
        --format esm --platform browser --minify \
        --file worker/maplibre-gl-worker.js
}

_common-build() {
    _build_styles
    _build_worker
}

build() {
    _common-build

    npm-run-all -p build-check build-ts
    npm run api-extractor
}

build
