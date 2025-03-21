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

build() {
    _generate_translations_bundles "src/base/localization/bundles"

    if [[ $1 != "--genFilesOnly" ]]; then
        tsc -p tsconfig.json
        npm run api-extractor
    fi
}

build $1
