#!/usr/bin/env bash
set -e

# Define paths relative to the script location
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR/.."
ROOT_DIR="$PROJECT_DIR/../.."

_generate_translations_bundles() {
    local bundles_dir="$PROJECT_DIR/$1"
    echo "Converting bundles in: $bundles_dir"

    # Call the common script to convert all JSON bundles to TypeScript
    node "$ROOT_DIR/common/scripts/convertBundleToTypeScript.mjs" "$bundles_dir"
}

_version() {
    # prepare the auxiliary __version.ts file so that the code can read the package version as a constant
    node -p "'// (C) 2021 GoodData Corporation' + '\n\n' + '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD' + '\n\n' + 'export const LIB_VERSION = ' + JSON.stringify(require('./package.json').version) + ';' +'\n\n' + 'export const LIB_DESCRIPTION = ' + JSON.stringify(require('./package.json').description) + ';' +'\n\n' + 'export const LIB_NAME = ' + JSON.stringify(require('./package.json').name) + ';'" >src/__version.ts
}

_build_styles() {
    sass --load-path=node_modules styles/scss:styles/css
}

_assets() {
    mkdir -p esm
    # first copy everything in the assets (in case there are non-SVG files)
    cp -rf src/assets esm/
    # then use svgo to optimize all the SVGs there
    svgo -rqf src/assets esm/assets
}

styles-build() {
    _assets
    _build_styles
}

_common-build() {
    _version
    _generate_translations_bundles "src/presentation/localization/bundles"
}

build() {
    _common-build

    if [[ $1 != "--genFilesOnly" ]]; then
        styles-build
        tsc -p tsconfig.build.json
        npm run api-extractor
    fi
}

build $1
