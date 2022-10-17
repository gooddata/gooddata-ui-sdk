#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))

# create dummy package.json for fossa-cli is able to detect pnpm module
# see https://github.com/fossas/fossa-cli/blob/master/docs/references/strategies/languages/nodejs/pnpm.md
pkg_path=${DIR}/../../config/rush/package.json
[ -f $pkg_path ] && {
  echo "ERROR: $pkg_path exists which is not expected"
  echo "This file supposed to be created only when running fossa scan"
  exit 1
} || echo '{}' > $pkg_path
