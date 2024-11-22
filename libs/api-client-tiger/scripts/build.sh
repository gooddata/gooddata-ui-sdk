#!/usr/bin/env bash
set -e

_version() {
    VERSION=$(node -p "require('./package.json').version")
    NAME=$(node -p "require('./package.json').name")
    DESCRIPTION=$(node -p "require('./package.json').description")
    sed -i \
        -e "s|\0.\0.\0|$VERSION|" \
        -e "s|LIB_NAME_PLACEHOLDER|$NAME|" \
        -e "s|LIB_DESCRIPTION_PLACEHOLDER|$DESCRIPTION|" \
        esm/__version.js esm/__version.d.ts
}

_post-build() {
    _version
}

build() {
    tsc -p tsconfig.json
    _post-build
    npm run api-extractor
}

build
