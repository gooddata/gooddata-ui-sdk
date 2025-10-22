#!/bin/bash
# Build stuff specific for neobackstop testing and then start dockerized tests

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))

cd $ROOT_DIR/libs/sdk-ui-tests
npm run neobackstop-prepare-docker
./neobackstop/run-neobackstop-compose.sh test
