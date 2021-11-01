#!/usr/bin/env bash

set -e

PACKAGE_DIR="$(echo $(cd $(dirname $0)/.. && pwd -P))"
DIST_DIR="${PACKAGE_DIR}/dist"
BABEL_BIN="${PACKAGE_DIR}/node_modules/.bin/babel"
PRETTIER_BIN="${PACKAGE_DIR}/node_modules/.bin/prettier"

DASHBOARD_PLUGIN_TEMPLATE_DIR="${PACKAGE_DIR}/../dashboard-plugin-template"
BUILD_DIR="${PACKAGE_DIR}/build"
JS_BUILD_DIR="${BUILD_DIR}/dashboard-plugin-template.js"
TS_BUILD_DIR="${BUILD_DIR}/dashboard-plugin-template.ts"
JS_TAR="${DIST_DIR}/dashboard-plugin-template.js.tgz"
TS_TAR="${DIST_DIR}/dashboard-plugin-template.ts.tgz"

# cleanup & dir setup
rm -rf "${DIST_DIR}"
rm -rf "${BUILD_DIR}"
mkdir "${DIST_DIR}"
mkdir "${BUILD_DIR}"

# first build main Plugin Development Toolkit assets
npm run build-cjs

#######################################################################
# Build dashboard-plugin-template for Typescript
#######################################################################

# copy sources & essential config from dashboard plugin template project
# this will be used as-is for TypeScript template
rsync -zarvm \
  --include="*/" \
  --include="src/**" \
  --include="package.json" \
  --include="webpack.config.js" \
  --include=".env.template" \
  --exclude="*" \
  "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/" \
  "${TS_BUILD_DIR}"

# create archive with TypeScript template
tar -czf "${TS_TAR}" -C "${TS_BUILD_DIR}" .

#######################################################################
# Build dashboard-plugin-template for JavaScript
#######################################################################

# start from assets used for TypeScript template
cp -R "${TS_BUILD_DIR}" "${JS_BUILD_DIR}"

# transpile TypeScript files to JavaScript
$BABEL_BIN --no-babelrc \
  --config-file "${PACKAGE_DIR}/.babelrc-js" \
  --extensions .ts,.tsx "${JS_BUILD_DIR}" -d "${JS_BUILD_DIR}"

# remove TypeScript files
find "${JS_BUILD_DIR}" -type f -regex '.*\.\(ts\|tsx\)' -exec rm -rf {} \;

# format transpiled files as format was broken during transpile process
$PRETTIER_BIN --write "${JS_BUILD_DIR}/**/*.{js,jsx}" \
  --parser typescript \
  --print-width 110 \
  --tab-width 4 \
  --trailing-comma all

# replace TypeScript related content in JavaScript files
# node -r esm "./src/processJavaScriptFiles.js" "${SCRIPT_PATH}/../build/tar-source"

# build tar with JavaScript bootstrap files
tar -czf ./dist/dashboard-plugin-template.js.tgz -C "${JS_BUILD_DIR}" .
