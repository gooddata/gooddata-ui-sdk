#!/usr/bin/env bash

SCRIPTDIR=`dirname $0`
ROOTDIR="${SCRIPTDIR}/.."
EXAMPLES="${ROOTDIR}/src/examples/"
EXAMPLESJS="${ROOTDIR}/examplesJS"

babel --no-babelrc --retain-lines \
--config-file "${ROOTDIR}/.babelrc-js-examples" \
--extensions .ts,.tsx,.jsx "${EXAMPLES}" -d "examplesJS" \
&& prettier --write "${EXAMPLESJS}/**/*" --print-width 110 --parser typescript