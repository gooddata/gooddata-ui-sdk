#!/usr/bin/env bash

# prepare the auxiliary __version.ts file so that the code can read the package version as a constant
echo '// (C) 2021 GoodData Corporation' >src/__version.ts
echo '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD' >>src/__version.ts
node -p "'export const LIB_VERSION = ' + JSON.stringify(require('./package.json').version) + ';' +'\n\n' + 'export const LIB_DESCRIPTION =' + '\n    ' + JSON.stringify(require('./package.json').description) + ';' +'\n\n' + 'export const LIB_NAME = ' + JSON.stringify(require('./package.json').name) + ';'" >>src/__version.ts

set -e

PACKAGE_DIR="$(echo $(cd $(dirname $0)/.. && pwd -P))"
DIST_DIR="${PACKAGE_DIR}/esm"
BABEL_BIN="${PACKAGE_DIR}/node_modules/.bin/babel"
PRETTIER_BIN="${PACKAGE_DIR}/node_modules/.bin/prettier"
TSNODE_BIN="${PACKAGE_DIR}/node_modules/.bin/ts-node"
PREPARE_PACKAGE_JSON="${TSNODE_BIN} --esm ${PACKAGE_DIR}/scripts/preparePackageJson.ts"

REACT_APP_TEMPLATE_DIR="${PACKAGE_DIR}/../react-app-template"
JS_CONFIG_TEMPLATES="${REACT_APP_TEMPLATE_DIR}/configTemplates/js"
TS_CONFIG_TEMPLATES="${REACT_APP_TEMPLATE_DIR}/configTemplates/ts"
BUILD_DIR="${PACKAGE_DIR}/build"
JS_BUILD_DIR="${BUILD_DIR}/react-app-template.js"
TS_BUILD_DIR="${BUILD_DIR}/react-app-template.ts"
JS_TAR="${DIST_DIR}/react-app-template.js.tgz"
TS_TAR="${DIST_DIR}/react-app-template.ts.tgz"

# cleanup & dir setup
rm -rf "${DIST_DIR}"
rm -rf "${BUILD_DIR}"
mkdir "${DIST_DIR}"
mkdir "${BUILD_DIR}"

# first build main Application Development Toolkit assets
tsc -p tsconfig.json

#######################################################################
# Build react-app-template for Typescript
#######################################################################

# copy sources & essential config from application template project
# this will be used as-is for TypeScript template
mkdir -p "${TS_BUILD_DIR}/src"
cp -R "${REACT_APP_TEMPLATE_DIR}/src" "${TS_BUILD_DIR}"
cp "${REACT_APP_TEMPLATE_DIR}/package.json" "${TS_BUILD_DIR}"
cp "${REACT_APP_TEMPLATE_DIR}/webpack.config.cjs" "${TS_BUILD_DIR}"
cp "${REACT_APP_TEMPLATE_DIR}/.gitignore" "${TS_BUILD_DIR}"
cp "${REACT_APP_TEMPLATE_DIR}/README.template.md" "${TS_BUILD_DIR}/README.md"

$PREPARE_PACKAGE_JSON remove-gd-stuff "${TS_BUILD_DIR}"

# 'fork-off' the JS template build dir at this point before adding TypeScript specific configs
cp -R "${TS_BUILD_DIR}" "${JS_BUILD_DIR}"

# copy over the extra files for the TypeScript project
[ -e "$TS_CONFIG_TEMPLATES" ] && find "$TS_CONFIG_TEMPLATES" -type f -name '*' -exec cp {} "${TS_BUILD_DIR}" ";"

# create archive with TypeScript template
tar -czf "${TS_TAR}" -C "${TS_BUILD_DIR}" .

#######################################################################
# Build react-app-template for JavaScript
#######################################################################

$PREPARE_PACKAGE_JSON remove-ts "${JS_BUILD_DIR}"

# copy over the extra files for the JavaScript project
[ -e "$JS_CONFIG_TEMPLATES" ] && find "$JS_CONFIG_TEMPLATES" -type f -name '*' -exec cp {} "${JS_BUILD_DIR}" ";"

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
tar -czf "${JS_TAR}" -C "${JS_BUILD_DIR}" .
