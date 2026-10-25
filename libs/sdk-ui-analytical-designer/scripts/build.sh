#!/usr/bin/env bash
set -e

_translations() {
    mkdir -p esm/translations
    cp -rf src/translations/. esm/translations/
}

_styles() {
    # styles/scss/*.scss -> styles/css/*.css; the stylesheets reference the images in styles/images
    # as @gooddata/sdk-ui-analytical-designer/styles/images/*, so nothing is copied into esm/.
    sass --load-path=node_modules styles/scss:styles/css
}

build() {
    rm -rf esm
    mkdir -p esm

    _translations
    _styles

    npm-run-all -p build-check build-ts
    npm run api-extractor
}

build
