#!/bin/bash

#
# This script prepares a new hotfix branch for a given prerelease version already released.
#

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)
_RUSH="${DIR}/docker_rush.sh"

source "${DIR}/utils.sh"

version=$(get_current_version)
is_prerelease=$(is_current_version_prerelease)

if [ ! "$is_prerelease" -eq 0 ]; then
  echo "You are attempting to create a hotfix branch for a pre-release version."
  echo "However, the current version (${version}) is not a pre-release."
  echo "Use the init_patch_branch job instead."
  exit 1
fi

if [ -z "$VERSION_TO_HOTFIX" ]; then
  echo "You did not specify the version to base the hotfix on."
  exit 1
fi

if [ -z "$JIRA_TICKET" ]; then
  echo "You did not specify the JIRA ticket for this hotfix."
  exit 1
fi

# Find existing hotfix branches for this version and use the latest one

# convert 8.1.0-alpha-26 to 810-alpha-26-fix
branch_base_name=$(echo "$VERSION_TO_HOTFIX" | sed 's/\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)-\([a-z]*\)\.\([0-9]*\)/\1\2\3-\4-\5/')-fix

# get the existing branch name and trim the leading whitespace that is there by default
existing_branch=$(git branch --all | grep -i "$branch_base_name" | tail -1 | sed 's/^ *//g')

if [ -z "$existing_branch" ]; then
  echo "Creating the first hotfix branch for $VERSION_TO_HOTFIX"

  echo "Getting the hash of the given version release commit"
  commit_hash=$(get_release_commit_hash "$VERSION_TO_HOTFIX")

  echo "Checking out the release commit $commit_hash"
  git checkout "$commit_hash"

  echo "Creating the first hotfix branch for $VERSION_TO_HOTFIX"
  git checkout -b "$branch_base_name"

  echo "Running the rush version bump"
  prerelease_id=$(echo "$VERSION_TO_HOTFIX" | sed 's/[0-9]*\.[0-9]*\.[0-9]*-\(.*\)/\1/').fix
  ${_RUSH} version --bump --override-bump prerelease --override-prerelease-id "$prerelease_id"

  echo "Commiting the results"
  git commit -a -m "Initialize prerelease fix version" -m "- $VERSION_TO_HOTFIX.fix.0" -m "JIRA: $JIRA_TICKET"

  # set variables for the CI to push the branch to origin
  TARGET_BRANCH=$branch_base_name
  branching_rc=0
else
  # in case there is only the first branch for a hotfix, that ends with -fix, assume the existing fix number is 0
  # otherwise parse the number from the branch name
  if [[ $existing_branch =~ '-fix$' ]]; then
    existing_fix_number=0
  else
    existing_fix_number=$(echo "$existing_branch" | sed 's/.*fix-\([0-9]*\)$/\1/')
  fi

  echo "Checking out the latest existing hotfix branch $existing_branch"
  git checkout "$existing_branch"

  echo "Creating the next hotfix branch for $VERSION_TO_HOTFIX"
  new_fix_number=$((existing_fix_number + 1))
  branch_name="$branch_base_name-$new_fix_number"
  git checkout -b "$branch_name"

  echo "Running the rush version bump"
  ${_RUSH} version --bump --override-bump prerelease

  echo "Commiting the results"
  git commit -a -m "Initialize prerelease fix version" -m "- $VERSION_TO_HOTFIX.fix.$new_fix_number" -m "JIRA: $JIRA_TICKET"

  # set variables for the CI to push the branch to origin
  TARGET_BRANCH=$branch_name
  branching_rc=0
fi

if [ -n "$SLACK_VARS_FILE" ]; then
  echo "Slack integration seems available. Going to write $SLACK_VARS_FILE with params"

  echo "LIBRARY_NAME=gooddata-ui-sdk" >"$SLACK_VARS_FILE"
  echo "TARGET_BRANCH=$TARGET_BRANCH" >>"$SLACK_VARS_FILE"
  echo "MESSAGE=just created *gooddata-ui-sdk* hotfix branch *$TARGET_BRANCH*" >>"$SLACK_VARS_FILE"
fi
