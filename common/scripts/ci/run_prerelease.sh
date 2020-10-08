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

version=$(get_current_version)
is_prerelease=$(is_current_version_prerelease)

if [ ! $is_prerelease -eq 0 ]; then
  echo "You are attempting a bump to a new pre-release version. However the current version (${version}) is not a pre-release."
  echo "Normally, each release actually creates a new version and then establishes the new pre-release (alpha.0) on top of "
  echo "which this script would bump to alpha.1 and release."
  echo
  echo "It is likely something went wrong during the previous release job or that the scripts or Rush version bumps are "
  echo "hosed. You need to correct the situation manually using the rush version command. See docs/releases.md for a "
  echo "detailed description of the version command behavior."

  exit 1
fi


${_RUSH} install
${_RUSH} build

${_RUSH} version --bump --override-bump prerelease
bump_rc=$?

if [ $bump_rc -ne 0 ]; then
    echo "Version bump failed. Stopping."

    exit 1
fi

export TAG_NPM="prerelease"
${DIR}/do_publish.sh
