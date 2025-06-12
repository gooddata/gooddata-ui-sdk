#!/bin/bash

#
# This script bumps from prerelease to real patch, creates release, makes commit, tags, updates changelogs.
#
# See docs/releases.md for more information how rush version bump behaves
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

source ${DIR}/utils.sh

version=$(get_current_version)
is_prerelease=$(is_current_version_prerelease)

if [ ! $is_prerelease -eq 0 ]; then
  echo "You are attempting a bump to a patch version. However the current version (${version}) is not a pre-release."
  echo "Normally, each release actually creates a new version and then establishes the new pre-release (alpha.0)."
  echo
  echo "It is likely something went wrong during the previous release job or that the scripts or Rush version bumps are "
  echo "hosed. You need to correct the situation manually using the rush version command. See docs/releases.md for a "
  echo "detailed description of the version command behavior."

  exit 1
fi


${_RUSH} install
${_RUSH} build

#
# First bump to the next patch
#
${_RUSH} version --bump --override-bump patch
bump_rc=$?

if [ $bump_rc -ne 0 ]; then
    echo "Version bump failed. Stopping."

    exit 1
fi

#
# Perform release; this will create commits & tags with the patch release in it.
#
export TAG_VERSION=TRUE
export TAG_NPM="latest"
${DIR}/do_publish.sh
publish_rc=$?

if [ $publish_rc -ne 0 ]; then
  echo "Publishing patch version failed. Please investigate the impact of this catastrophe and correct manually. Good luck."
fi
