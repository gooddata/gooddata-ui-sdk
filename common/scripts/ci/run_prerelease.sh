#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

${_RUSH} install
${_RUSH} build

# Bump package versions
${_RUSH} version --bump --override-prerelease-id alpha

# Perform dry-run first
${_RUSH} publish --include-all

dry_run_rc=$?

if [ $dry_run_rc -ne 0 ]; then
    echo "Publish dry run has failed. Stopping"
else
    echo "Publishing to NPM"

    # All good, do the real thing
    ${_RUSH} publish -p --include-all

    if [ ! -z "$SLACK_VARS_FILE" ]; then
        echo "Slack integration seems available. Going to write $SLACK_VARS_FILE with params"

        LIBRARY_VERSION=$(jq -r ".version" "libs/sdk-ui/package.json")

        echo "LIBRARY_NAME=gooddata-ui-sdk" > $SLACK_VARS_FILE
        echo "LIBRARY_VERSION=$LIBRARY_VERSION" >> $SLACK_VARS_FILE
        echo "MESSAGE=just released *gooddata-ui-sdk@$LIBRARY_VERSION* >> $SLACK_VARS_FILE
    fi
fi
