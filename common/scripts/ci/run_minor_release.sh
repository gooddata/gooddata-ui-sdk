#!/bin/bash

#
# This script bumps from prerelease to real minor, creates release, makes commit, tags, updates changelogs. After
# that it creates prerelease for the next minor and creates commit.
#
# See docs/releases.md for more information how rush version bump behaves
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

source ${DIR}/utils.sh

version=$(get_current_version)
is_prerelease=$(is_current_version_prerelease)

if [ ! $is_prerelease -eq 0 ]; then
  echo "You are attempting a bump to a minor version. However the current version (${version}) is not a pre-release."
  echo "Normally, each release actually creates a new version and then establishes the new pre-release (alpha.0)."
  echo
  echo "It is likely something went wrong during the previous release job or that the scripts or Rush version bumps are "
  echo "hosed. You need to correct the situation manually using the rush version command. See docs/releases.md for a "
  echo "detailed description of the version command behavior."

  exit 1
fi


${_RUSH} install
${_RUSH} build-all

#
# First bump to the next minor
#
${_RUSH} version --bump --override-bump minor
bump_rc=$?

if [ $bump_rc -ne 0 ]; then
    echo "Version bump failed. Stopping."

    exit 1
fi

#
# Perform release; this will create commits & tags with the major release in it.
#
export TAG_VERSION=TRUE
export TAG_NPM="latest"
${DIR}/do_publish.sh
publish_rc=$?

if [ $publish_rc -ne 0 ]; then
  echo "Publishing minor version failed. Please investigate the impact of this catastrophe and correct manually. Good luck."
else
  #
  # Now that the mior is published and commit created, prepare for the next minor release.
  # This is done by using the 'preminor' bump (see docs/releases.md for more info about the bump behavior)
  #

  ${_RUSH} version --bump --override-bump preminor --override-prerelease-id alpha
  NEXT_MINOR=$(get_current_version)
  # stage all modified json files
  git ls-files | grep '\.json' | xargs git add
  git commit -m "Prepare for next minor release ${NEXT_MINOR}"
fi
