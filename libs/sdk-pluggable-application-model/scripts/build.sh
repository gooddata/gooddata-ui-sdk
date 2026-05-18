#!/usr/bin/env bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR/.."

_version() {
    node -p "'// (C) 2026 GoodData Corporation' + '\n\n' + '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD' + '\n\n' + '/** @alpha */\nexport const LIB_VERSION: string = ' + JSON.stringify(require('./package.json').version) + ';\n\n' + '/** @alpha */\nexport const LIB_DESCRIPTION: string = ' + JSON.stringify(require('./package.json').description) + ';\n\n' + '/** @alpha */\nexport const LIB_NAME: string = ' + JSON.stringify(require('./package.json').name) + ';'" >src/__version.ts
}

build() {
    _version

    if [[ $1 != "--genFilesOnly" ]]; then
        npm-run-all -p build-check build-ts
        npm run api-extractor
    fi
}

cd "$PROJECT_DIR"
build $1
