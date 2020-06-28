#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

source ./utils.sh

version=$(get_current_version)
is_prerelease=$(is_current_version_prerelease)

if [ ! $is_prerelease -eq 0 ]; then
  echo "You are attempting a change to a new pre-release type. However the current version (${version}) is not a pre-release."
  echo "Normally, each release actually creates a new version and then establishes the new pre-release (alpha.0) on top of "
  echo "which this script would change to say beta.0 and release."
  echo
  echo "It is likely something went wrong during the previous release job or that the scripts or Rush version bumps are "
  echo "hosed. You need to correct the situation manually using the rush version command. See docs/releases.md for a "
  echo "detailed description of the version command behavior."

  exit 1
fi


${_RUSH} install
${_RUSH} build

# Bump package prerelease version
# This command will retain current prerelease type and bump the number that follows it
# Can thus be used to bump either alpha or beta or whatever else we will have.
${_RUSH} version --bump --override-type prerelease --override-prerelease-id ${PRERELEASE_ID}
bump_rc=$?

if [ $bump_rc -ne 0 ]; then
    echo "Version bump failed. Stopping."

    exit 1
fi

# Perform dry-run first
${_RUSH} publish --include-all
dry_run_rc=$?

if [ $dry_run_rc -ne 0 ]; then
    echo "Publish dry run has failed. Stopping."

    exit 1
fi

echo "Publishing to NPM"

# All good, do the real thing
${_RUSH} publish -n "${NPM_PUBLISH_TOKEN}" -p --include-all
publish_rc=$?

if [ $publish_rc -ne 0 ]; then
    echo "Publication has failed. Stopping."

    exit 1
else
    LIBRARY_VERSION=$(jq -r ".version" "libs/sdk-ui/package.json")

    echo "Successfully published new version ${LIBRARY_VERSION}. Creating commit to document this."

    # stage all modified json files
    git ls-files | grep '\.json' | xargs git add
    git commit -m "Release ${LIBRARY_VERSION}"

    if [ ! -z "$SLACK_VARS_FILE" ]; then
        echo "Slack integration seems available. Going to write $SLACK_VARS_FILE with params"

        echo "LIBRARY_NAME=gooddata-ui-sdk" > $SLACK_VARS_FILE
        echo "LIBRARY_VERSION=$LIBRARY_VERSION" >> $SLACK_VARS_FILE
        echo "MESSAGE=just released *gooddata-ui-sdk@$LIBRARY_VERSION*" >> $SLACK_VARS_FILE
    fi
fi

