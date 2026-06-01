#!/usr/bin/env bash
# (C) 2026 GoodData Corporation
#
# Runs just before `npm pack` collects files for the published tarball.
# Bundles the template workspace projects (gdc-app-template-name-module +
# gdc-app-template-name-harness) into `dist/templates/<subtree>/`, with
# workspace-only paths rewritten to self-contained equivalents.
#
# Two transformations happen here:
#   1. File copy + strip of build artefacts (node_modules, esm/, dist/, etc.)
#   2. tsconfig.json inlining: replace the `extends` chain with the fully-
#      resolved config (via tsc --showConfig) so the published template has
#      self-contained tsconfigs that work in any consumer repo.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"

# Locate the template workspace projects via the resolved workspace dep symlinks.
MODULE_SRC="$(node -p "require('path').dirname(require.resolve('gdc-app-template-name-module/tsconfig.json', { paths: ['$PACKAGE_DIR'] }))")"
HARNESS_SRC="$(node -p "require('path').dirname(require.resolve('gdc-app-template-name-harness/tsconfig.json', { paths: ['$PACKAGE_DIR'] }))")"

DEST="$PACKAGE_DIR/dist/templates"
rm -rf "$DEST"
mkdir -p "$DEST/module" "$DEST/harness"

# -a preserves attrs (incl. executable bits on .sh files inside the templates).
# Trailing slash + . copies the directory contents, not the directory itself.
cp -a "$MODULE_SRC/." "$DEST/module/"
cp -a "$HARNESS_SRC/." "$DEST/harness/"

# Drop workspace-only build artefacts that shouldn't ship in the tarball.
for subtree in module harness; do
    rm -rf "$DEST/$subtree/node_modules" \
           "$DEST/$subtree/dist" \
           "$DEST/$subtree/esm" \
           "$DEST/$subtree/.rush" \
           "$DEST/$subtree/rush-logs" \
           "$DEST/$subtree/.__mf__temp" \
           "$DEST/$subtree/.vite"
    find "$DEST/$subtree" -name "*.tsbuildinfo" -delete 2>/dev/null || true
done

# Drop gdc-ui-specific tooling configs. These exist in the workspace template
# so the template projects themselves participate in gdc-ui's Rush + goodchanges
# workflows, but external client repos use neither tool so the files are noise.
# (Internal scaffolding uses workspace template + overlay, so this strip never
# fires for internal scaffolds — it only affects the published tarball.)
for subtree in module harness; do
    rm -rf "$DEST/$subtree/.goodchangesrc.json" \
           "$DEST/$subtree/config"
done

# Inline tsconfig.json by resolving its `extends` chain via tsc --showConfig.
# Run in the SOURCE directory (where extends resolution finds workspace files),
# then write the resolved JSON into the DEST. This produces a self-contained
# tsconfig that needs no parent files in the consumer's repo.
inline_tsconfig() {
    local subtree="$1"
    local src_dir="$2"
    local dest_file="$DEST/$subtree/tsconfig.json"

    if [ ! -f "$src_dir/tsconfig.json" ]; then
        echo "[prepack] WARNING: no tsconfig.json in $src_dir — skipping inline"
        return
    fi

    # Use the workspace's tsc to resolve the extends chain. Writes the fully-
    # merged config (compilerOptions, include, exclude) as plain JSON.
    (cd "$src_dir" && npx tsc --showConfig) > "$dest_file.resolved"

    # Replace the destination tsconfig.json with the resolved version.
    mv "$dest_file.resolved" "$dest_file"
}

inline_tsconfig "module" "$MODULE_SRC"
inline_tsconfig "harness" "$HARNESS_SRC"

# Defense in depth: tsc --showConfig fills in a default `exclude` containing
# `<outDir>` resolved to ABSOLUTE if the source tsconfig didn't declare one,
# leaking the publisher's filesystem path into the published tarball. Catch any
# tsconfig that ends up with such a leak so future contributors don't reintroduce
# the bug by forgetting an explicit `exclude` field in a new template tsconfig.
REPO_ROOT="$(cd "$PACKAGE_DIR/../../.." && pwd)"
for subtree in module harness; do
    tsconfig="$DEST/$subtree/tsconfig.json"
    if grep -q "$REPO_ROOT" "$tsconfig"; then
        echo "[prepack] ERROR: bundled $tsconfig contains an absolute publisher path." >&2
        echo "[prepack] Likely cause: the source tsconfig is missing an explicit \"exclude\" field," >&2
        echo "[prepack] so tsc --showConfig filled it in with the absolute outDir." >&2
        grep "$REPO_ROOT" "$tsconfig" >&2
        exit 1
    fi
done

echo "[prepack] bundled templates into dist/templates/ (tsconfigs inlined)"
