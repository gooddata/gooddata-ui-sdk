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
    echo "Publish dry run has failed. Stopping."

    exit 1
else
    echo "Publishing to NPM"

    # All good, do the real thing
    ${_RUSH} publish -n "${NPM_PUBLISH_TOKEN}" -p --include-all

    rc=$?

    if [ $rc -ne 0 ]; then
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
fi
