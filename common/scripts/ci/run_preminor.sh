#!/bin/bash

#
# This script creates prerelease version for the next minor and creates commit.
#
# See docs/releases.md for more information how rush version bump behaves
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

source ${DIR}/utils.sh

${_RUSH} version --bump --override-bump preminor --override-prerelease-id alpha
bump_rc=$?

if [ $bump_rc -ne 0 ]; then
    echo "Version bump failed. Stopping."

    exit 1
fi

NEXT_MINOR=$(get_current_version)
# stage all modified json files
git ls-files | grep '\.json' | xargs git add
git commit -m "Prepare for next minor release ${NEXT_MINOR}"
