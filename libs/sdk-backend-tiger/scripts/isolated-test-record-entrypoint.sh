#!/bin/bash

ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))
cd $ROOT_DIR
set -e
./tests/goodmock/start_recording.sh
if [[ $UPDATE_SNAPSHOTS == "true" ]]; then
    npm run isolated-test-rec-snapshots
else
    npm run isolated-test-rec
fi
./tests/goodmock/stop_recording.sh

npm run format-write
