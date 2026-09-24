#!/usr/bin/env bash
set -e

# prepare the auxiliary __version.ts file so that the code can read the package version as a constant
node -p "'// (C) 2021 GoodData Corporation' + '\n\n' + '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD' + '\n\n' + 'export const LIB_VERSION = ' + JSON.stringify(require('./package.json').version) + ';' +'\n\n' + 'export const LIB_DESCRIPTION = ' + JSON.stringify(require('./package.json').description) + ';' +'\n\n' + 'export const LIB_NAME = ' + JSON.stringify(require('./package.json').name) + ';'" >src/__version.ts

if [[ $1 == "--genFilesOnly" ]]; then
  #we need just version file and it is generated, so we can exit
  exit 0
fi;

set -e

PACKAGE_DIR="$(echo $(cd $(dirname $0)/.. && pwd -P))"
DIST_DIR="${PACKAGE_DIR}/esm"
TSC_BIN="${PACKAGE_DIR}/node_modules/.bin/tsc"
OXFMT_BIN="${PACKAGE_DIR}/node_modules/.bin/oxfmt"
PREPARE_PACKAGE_JSON="node ${PACKAGE_DIR}/scripts/preparePackageJson.mjs"

REACT_APP_TEMPLATE_DIR="${PACKAGE_DIR}/../react-app-template"
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
tsc -p tsconfig.build.json

#######################################################################
# Assemble the language-independent part of the template
#######################################################################

# copy sources & essential config from application template project
# this will be used as-is for TypeScript template
mkdir -p "${TS_BUILD_DIR}/src"
cp -R "${REACT_APP_TEMPLATE_DIR}/src" "${TS_BUILD_DIR}"
# Vite serves public/ from the root and copies its contents verbatim into dist/
cp -R "${REACT_APP_TEMPLATE_DIR}/public" "${TS_BUILD_DIR}"
cp "${REACT_APP_TEMPLATE_DIR}/package.json" "${TS_BUILD_DIR}"
cp "${REACT_APP_TEMPLATE_DIR}/vite.config.ts" "${TS_BUILD_DIR}"
# Vite's entry point. Its <script src> names src/index.tsx; the JS section below derives its own copy from it.
cp "${REACT_APP_TEMPLATE_DIR}/index.html" "${TS_BUILD_DIR}"
cp "${REACT_APP_TEMPLATE_DIR}/.gitignore" "${TS_BUILD_DIR}"
cp "${REACT_APP_TEMPLATE_DIR}/.env.template" "${TS_BUILD_DIR}/.env"
cp "${REACT_APP_TEMPLATE_DIR}/README.template.md" "${TS_BUILD_DIR}/README.md"

$PREPARE_PACKAGE_JSON remove-gd-stuff "${TS_BUILD_DIR}"

# 'fork-off' the JS template build dir at this point before adding TypeScript specific configs
cp -R "${TS_BUILD_DIR}" "${JS_BUILD_DIR}"

#######################################################################
# Build react-app-template for Typescript
#######################################################################

# The template type-checks with the same tsconfig it is developed against (noEmit - Vite transpiles), so ship
# that file rather than a copy that drifts.
cp "${REACT_APP_TEMPLATE_DIR}/tsconfig.json" "${TS_BUILD_DIR}"

grep -q 'src="/src/index.tsx"' "${TS_BUILD_DIR}/index.html" || { echo "TS template index.html does not load src/index.tsx" >&2; exit 1; }

# create archive with TypeScript template.
# COPYFILE_DISABLE stops macOS bsdtar from adding AppleDouble "._<name>" entries for files that carry extended
# attributes (the cp'd build copies do). node-tar extracts those as plain files, so a scaffolded app would get a
# binary "._.env" next to ".env". GNU tar on Linux CI ignores the variable.
COPYFILE_DISABLE=1 tar -czf "${TS_TAR}" -C "${TS_BUILD_DIR}" .

#######################################################################
# Build react-app-template for JavaScript
#######################################################################

$PREPARE_PACKAGE_JSON remove-ts "${JS_BUILD_DIR}"

# index.html is identical for both languages except for the entry point it loads. Derive the JS copy from the
# root one so the two cannot drift.
sed 's#src="/src/index\.tsx"#src="/src/index.jsx"#' "${REACT_APP_TEMPLATE_DIR}/index.html" >"${JS_BUILD_DIR}/index.html"

# transpile TypeScript template files to JavaScript (type-strip only; JSX and ESM preserved).
# tsc (jsx: preserve) emits .ts -> .js and .tsx -> .jsx directly. tsconfig.babel.json sets
# "noCheck", so it only emits and does not type-check the template (whose deps are not installed
# in the build dir).
"${TSC_BIN}" -p "${PACKAGE_DIR}/tsconfig.babel.json"

# remove TypeScript source files (leaving the emitted .js / .jsx in place)
find "${JS_BUILD_DIR}" -type f \( -iname \*.ts -o -iname \*.tsx \) -exec rm -rf {} \;

# format transpiled files as format was broken during transpile process.
# Restricted to the JavaScript sources: the template now has a root public/ directory, which the previous
# '**/*' glob would have handed to oxfmt as a binary favicon.
test -f "${JS_BUILD_DIR}/vite.config.js" || { echo "JS template has no vite.config.js (tsc did not emit it)" >&2; exit 1; }
find "${JS_BUILD_DIR}/src" -type f \( -name '*.js' -o -name '*.jsx' \) -exec "${OXFMT_BIN}" {} +
"${OXFMT_BIN}" "${JS_BUILD_DIR}/vite.config.js"

grep -q 'src="/src/index.jsx"' "${JS_BUILD_DIR}/index.html" || { echo "JS template index.html does not load src/index.jsx" >&2; exit 1; }

# build tar with JavaScript bootstrap files (COPYFILE_DISABLE: see the TypeScript archive above)
COPYFILE_DISABLE=1 tar -czf "${JS_TAR}" -C "${JS_BUILD_DIR}" .
