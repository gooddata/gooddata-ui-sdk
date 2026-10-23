#!/usr/bin/env bash
set -e

build() {
    mkdir -p esm

    npm-run-all -p build-check build-ts

    # Replace .scss imports with .css imports in all generated JS files
    # Handle different sed syntax between macOS (BSD) and Linux (GNU)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        find esm -name "*.js" -type f -exec sed -i '' 's/\.scss"/\.css"/g' {} +
    else
        # Linux/CI
        find esm -name "*.js" -type f -exec sed -i 's/\.scss"/\.css"/g' {} +
    fi
}

build
