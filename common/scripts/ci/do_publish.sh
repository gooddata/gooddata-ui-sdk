#!/bin/bash

#
# This script runs Rush commands to perform release.
#

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

${_RUSH} publish --include-all --version-policy sdk --set-access-level public
dry_run_rc=$?

if [ $dry_run_rc -ne 0 ]; then
    echo "Publish dry run has failed. Stopping."

    if [ ! -z "$SLACK_VARS_FILE" ]; then
        echo "Slack integration seems available. Going to write $SLACK_VARS_FILE with params"

        echo "LIBRARY_NAME=gooddata-ui-sdk" > $SLACK_VARS_FILE
        echo "LIBRARY_VERSION=$LIBRARY_VERSION" >> $SLACK_VARS_FILE
        echo "MESSAGE=just failed doing dry-run of release *gooddata-ui-sdk@$LIBRARY_VERSION* - keep calm and investigate, this was just dry-run" >> $SLACK_VARS_FILE
    fi

    exit 1
fi

#
# Default to `prerelease`
#
if [ -z ${TAG_NPM} ]; then
  echo "Please specify TAG_NPM env variable. This is used to tag the release on NPM (latest for major and minor, prerelease for alpha or beta)."
  exit 1
fi

#
# All good, do the real thing
#
echo "Publishing to NPM"

# forcing restricted access level; switch this to public
${_RUSH} publish -p --include-all --version-policy sdk --tag "${TAG_NPM}" --set-access-level public
publish_rc=$?

if [ $publish_rc -ne 0 ]; then
    echo "Publication has failed. Stopping."

    if [ ! -z "$SLACK_VARS_FILE" ]; then
        echo "Slack integration seems available. Going to write $SLACK_VARS_FILE with params"

        echo "LIBRARY_NAME=gooddata-ui-sdk" > $SLACK_VARS_FILE
        echo "LIBRARY_VERSION=$LIBRARY_VERSION" >> $SLACK_VARS_FILE
        echo "MESSAGE=just *FAILED* releasing *gooddata-ui-sdk@$LIBRARY_VERSION* :hocho: ; it is highly likely that some packages were published and some were not." >> $SLACK_VARS_FILE
    fi

    exit 1
else
    LIBRARY_VERSION=$(get_current_version)

    echo "Successfully published new version ${LIBRARY_VERSION}. Creating commit to document this."

    # Ensure changelog files are added for tracking if they were created just now
    ROOT_DIR=${DIR}/../../..
    git add ${ROOT_DIR}/libs/sdk-ui-all/CHANGELOG.*
    # Stage all modified json files
    git ls-files | grep '\.json' | xargs git add
    git commit -m "Release ${LIBRARY_VERSION}"

    if [ ! -z "$TAG_VERSION" ]; then
         echo "Adding tag ${LIBRARY_VERSION} - Release ${LIBRARY_VERSION}"

         git tag -a "${LIBRARY_VERSION}" -m "Release ${LIBRARY_VERSION}"
    fi

    if [ ! -z "$SLACK_VARS_FILE" ]; then
        echo "Slack integration seems available. Going to write $SLACK_VARS_FILE with params"

        echo "LIBRARY_NAME=gooddata-ui-sdk" > $SLACK_VARS_FILE
        echo "LIBRARY_VERSION=$LIBRARY_VERSION" >> $SLACK_VARS_FILE
        echo "MESSAGE=just released *gooddata-ui-sdk@$LIBRARY_VERSION*" >> $SLACK_VARS_FILE
    fi

    exit 0
fi
