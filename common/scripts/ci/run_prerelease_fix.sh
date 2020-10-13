#!/bin/bash

#
# This script bumps to next prerelease version and then triggers the publication. The script does not care
# about the current prerelease type. It relies on rush version to keep the current prerelease type and do the +1.
#
# Note the strict version checking at the start. This is in place because trying to bump prerelease version
# while the current version _is not_ prerelease has undesired effect: creates prerelease of next patch release.
# In our context, we never want prerelease to create next patch release.
#
# See docs/releases.md for more information how rush version bump behaves
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

source ${DIR}/utils.sh

${_RUSH} install
${_RUSH} build

export TAG_NPM="hotfix"
${DIR}/do_publish.sh
