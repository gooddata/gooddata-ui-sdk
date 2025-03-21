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


_build_styles() {
    sass --load-path=node_modules styles/scss:styles/css
}

_assets() {
    mkdir -p esm
    # first copy everything in the assets (in case there are non-SVG files)
    # cp -rf src/assets esm/
    # then use svgo to optimize all the SVGs there
    # svgo -rqf src/assets esm/assets
}

_common-build() {
    _assets

    _build_styles
}

build() {

    _generate_translations_bundles "src/localization/bundles"

    if [[ $1 != "--genFilesOnly" ]]; then
        _common-build

        tsc -p tsconfig.json
        npm run api-extractor
    fi
}

build $1
