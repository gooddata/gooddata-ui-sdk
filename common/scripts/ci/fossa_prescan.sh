#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))

# install the dependencies using Rush
node "${DIR}/../install-run-rush.js" install