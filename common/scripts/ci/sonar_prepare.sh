#!/bin/bash

#
# This script prepares the repository to be audited by SonarQube
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"

# for now, we only need to install the dependencies
${_RUSH} install
