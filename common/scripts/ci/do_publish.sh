#!/bin/bash

#
# This script runs Rush commands to perform release.
#

# TODO: support official releases (e.g. anyhthing else than prerelease).
# mostly small things remaining:
# 1.  Correctly commit changelog updates (script now only commits JSON files)
# 2.  Tag the commit
# 3.  After publication, spin of prerelease version of the next minor (do not publish):
#     rush version --bump --override-bump-type preminor --override-prerelease-id alpha

#
# Supported environment variables:
#
# NPM_PUBLISH_TOKEN
# NPM token that will be used for the publish commands
# mandatory; script bombs if not present.
#
# SLACK_VARS_FILE
# file name where script can output information that will then land in slack channel
# optional; nothing happens
#
# NPM_ACCESS_LEVEL
# indicate what access level to set for published packages. 'public' means packages will be visible
# to everyone in the world. anything else and the access will be 'restricted' meaning packages only visible
# to people with access to our org
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

source ${DIR}/utils.sh

if [ -z ${NPM_PUBLISH_TOKEN} ]; then
  echo "NPM Token to use for publication is not set. Please make sure the NPM_PUBLISH_TOKEN variable is set."
  exit 1
fi

#
# Perform dry-run first
#

${_RUSH} publish --include-all
dry_run_rc=$?

if [ $dry_run_rc -ne 0 ]; then
    echo "Publish dry run has failed. Stopping."

    exit 1
fi

#
# All good, do the real thing
#
access_level=$(get_sanitized_access_level)

echo "Publishing to NPM. Package access level setting to: ${access_level}"

publish_rc=1
if [ "$access_level" == "public" ]; then
  echo "Trigger rush public with set-access-level public"

  ${_RUSH} publish -n "${NPM_PUBLISH_TOKEN}" -p --include-all --set-access-level public
  publish_rc=$?
else
  ${_RUSH} publish -n "${NPM_PUBLISH_TOKEN}" -p --include-all
  publish_rc=$?
fi

if [ $publish_rc -ne 0 ]; then
    echo "Publication has failed. Stopping."

    exit 1
else
    LIBRARY_VERSION=$(get_current_version)

    echo "Successfully published new version ${LIBRARY_VERSION}. Creating commit to document this."

    # stage all modified json files
    git ls-files | grep '\.json' | xargs git add
    git commit -m "Release ${LIBRARY_VERSION}"

    if [ ! -z "$SLACK_VARS_FILE" ]; then
        echo "Slack integration seems available. Going to write $SLACK_VARS_FILE with params"

        echo "LIBRARY_NAME=gooddata-ui-sdk" > $SLACK_VARS_FILE
        echo "LIBRARY_VERSION=$LIBRARY_VERSION" >> $SLACK_VARS_FILE

        if [ "$access_level" == "public" ]; then
          echo "MESSAGE=just released *publicly available* version *gooddata-ui-sdk@$LIBRARY_VERSION*" >> $SLACK_VARS_FILE
        else
          echo "MESSAGE=just released *gooddata-ui-sdk@$LIBRARY_VERSION*" >> $SLACK_VARS_FILE
        fi;

    fi
fi
