#!/usr/bin/env bash

set -e

PACKAGE_DIR="$(echo $(cd $(dirname $0)/.. && pwd -P))"
DIST_DIR="${PACKAGE_DIR}/esm"
BABEL_BIN="${PACKAGE_DIR}/node_modules/.bin/babel"
PRETTIER_BIN="${PACKAGE_DIR}/node_modules/.bin/prettier"
TSNODE_BIN="${PACKAGE_DIR}/node_modules/.bin/ts-node"
PREPARE_PACKAGE_JSON="${TSNODE_BIN} --esm ${PACKAGE_DIR}/scripts/preparePackageJson.ts"

DASHBOARD_PLUGIN_TEMPLATE_DIR="${PACKAGE_DIR}/../dashboard-plugin-template"
JS_CONFIG_TEMPLATES="${DASHBOARD_PLUGIN_TEMPLATE_DIR}/configTemplates/js/*"
JS_CONFIG_TEMPLATES_DOT="${DASHBOARD_PLUGIN_TEMPLATE_DIR}/configTemplates/js/.[^.]*"
TS_CONFIG_TEMPLATES="${DASHBOARD_PLUGIN_TEMPLATE_DIR}/configTemplates/ts/*"
TS_CONFIG_TEMPLATES_DOT="${DASHBOARD_PLUGIN_TEMPLATE_DIR}/configTemplates/ts/.[^.]*"
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
npm run build-esm

#######################################################################
# Build dashboard-plugin-template for Typescript
#######################################################################

# copy sources & essential config from dashboard plugin template project
# this will be used as-is for TypeScript template
mkdir -p "${TS_BUILD_DIR}/src"
cp -R "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/src" "${TS_BUILD_DIR}"
mkdir -p "${TS_BUILD_DIR}/scripts"
cp -R "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/scripts" "${TS_BUILD_DIR}"
cp "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/package.json" "${TS_BUILD_DIR}"
cp "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/webpack.config.cjs" "${TS_BUILD_DIR}"
cp "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/.env.template" "${TS_BUILD_DIR}/.env"
cp "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/.env.secrets.template" "${TS_BUILD_DIR}/.env.secrets"
cp "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/.gitignore" "${TS_BUILD_DIR}"
cp "${DASHBOARD_PLUGIN_TEMPLATE_DIR}/README.template.md" "${TS_BUILD_DIR}/README.md"

$PREPARE_PACKAGE_JSON remove-gd-stuff "${TS_BUILD_DIR}"

# 'fork-off' the JS template build dir at this point before adding TypeScript specific configs
cp -R "${TS_BUILD_DIR}" "${JS_BUILD_DIR}"

# copy over the eslint, prettier and jest config files for the TypeScript project
cp ${TS_CONFIG_TEMPLATES} "${TS_BUILD_DIR}"
cp ${TS_CONFIG_TEMPLATES_DOT} "${TS_BUILD_DIR}"

# create archive with TypeScript template
tar -czf "${TS_TAR}" -C "${TS_BUILD_DIR}" .

#######################################################################
# Build dashboard-plugin-template for JavaScript
#######################################################################

$PREPARE_PACKAGE_JSON remove-ts "${JS_BUILD_DIR}"

# copy over the eslint, prettier and jest config files for the JavaScript project
cp ${JS_CONFIG_TEMPLATES} "${JS_BUILD_DIR}"
cp ${JS_CONFIG_TEMPLATES_DOT} "${JS_BUILD_DIR}"

# transpile TypeScript files to JavaScript
$BABEL_BIN --no-babelrc \
  --config-file "${PACKAGE_DIR}/.babelrc-js" \
  --extensions .ts,.tsx "${JS_BUILD_DIR}" -d "${JS_BUILD_DIR}"

# remove TypeScript files
find "${JS_BUILD_DIR}" -type f \( -iname \*.ts -o -iname \*.tsx -o -iname \*.d.js \) -exec rm -rf {} \;

# rename react files to .jsx
find "${TS_BUILD_DIR}" -type f -iname \*.tsx | cut -c $((${#TS_BUILD_DIR} + 2))- | cut -sd . -f 1 | xargs -I {} mv "${JS_BUILD_DIR}/{}.js" "${JS_BUILD_DIR}/{}.jsx"

# format transpiled files as format was broken during transpile process
$PRETTIER_BIN --write "${JS_BUILD_DIR}/**/*.{js,jsx}" \
  --parser typescript \
  --print-width 110 \
  --tab-width 4 \
  --trailing-comma all

# build tar with JavaScript bootstrap files
tar -czf ./esm/dashboard-plugin-template.js.tgz -C "${JS_BUILD_DIR}" .
