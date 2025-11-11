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

_generate_tsm() {
    npm run tsm
}

_common-build() {
    mkdir -p esm

    sass --load-path=node_modules styles/scss:styles/css
    sass --load-path=node_modules src:esm
}

build() {
    _generate_translations_bundles "src/localization/bundles"

    _generate_tsm

    if [[ $1 != "--genFilesOnly" ]]; then
        _common-build

        tsc -p tsconfig.build.json
        npm run api-extractor

        # Replace .scss imports with .css imports in all generated JS files
        # Handle different sed syntax between macOS (BSD) and Linux (GNU)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            find esm -name "*.js" -type f -exec sed -i '' 's/\.scss\.js"/\.css"/g' {} +
        else
            # Linux/CI
            find esm -name "*.js" -type f -exec sed -i 's/\.scss\.js"/\.css"/g' {} +
        fi
    fi
}

build $1
