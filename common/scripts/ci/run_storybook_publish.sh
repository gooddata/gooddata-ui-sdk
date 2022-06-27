#!/bin/bash -u

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

$_RUSH install
$_RUSH build -t sdk-ui-tests
$_RUSHX libs/sdk-ui-tests build-storybook

LAST_COMMIT_HASH=$(git log -n1 --format="%h")

# BUCKET env. variable must be defined outside the script
aws s3 cp --recursive libs/sdk-ui-tests/dist-storybook s3://${BUCKET}
echo $LAST_COMMIT_HASH | aws s3 cp - s3://${BUCKET}/.current_version
