#!/bin/bash

#
# This script is slightly trickier than rest because it involves building stuff specific for
# sdk-ui-tests package & then running dockerized backstop
#
# - The dockerized `rushx` is used to run package-specific scripts needed to prepare artifacts for backstopjs testing
# - Then the backstop script is started directly to run the dockerized backstop
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

$_RUSH install
# only build everything that sdk-ui-tests need, no need to build sdk-examples for instance
$_RUSH build -T sdk-ui-tests
$_RUSHX libs/sdk-ui-tests build-storybook
$_RUSHX libs/sdk-ui-tests story-extractor

cd libs/sdk-ui-tests/backstop
./run-backstop.sh test
