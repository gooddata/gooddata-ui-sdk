#!/usr/bin/env bash

_version() {
    # prepare the auxiliary __version.ts file so that the code can read the package version as a constant
    echo '// (C) 2021 GoodData Corporation' >src/__version.ts
    echo '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD' >>src/__version.ts
    node -p "'export const LIB_VERSION = ' + JSON.stringify(require('./package.json').version) + ';' +'\n\n' + 'export const LIB_DESCRIPTION = ' + JSON.stringify(require('./package.json').description) + ';' +'\n\n' + 'export const LIB_NAME = ' + JSON.stringify(require('./package.json').name) + ';'" >>src/__version.ts
}

_common-build() {
   _version
}

build() {
    _common-build

    tsc -p tsconfig.json
}

build
