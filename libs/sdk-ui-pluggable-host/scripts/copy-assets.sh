#!/usr/bin/env bash
# Copy non-TypeScript source files (CSS, SCSS, SVG) into esm/ preserving src/ structure.
# tsgo only emits .js/.d.ts, so styles and assets that the source imports must be
# copied explicitly.

set -e

cd "$(dirname "$0")/.."

find src \( -name '*.css' -o -name '*.scss' -o -name '*.svg' \) | while read -r f; do
    dest="esm/${f#src/}"
    mkdir -p "$(dirname "$dest")"
    cp "$f" "$dest"
done
