#!/bin/bash

ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))
cd $ROOT_DIR
set -e
npm run clear-recordings
./tests/wiremock/start_recording.sh
if [[ $UPDATE_SNAPSHOTS == "true" ]]; then
    npm run isolated-test-rec-snapshots
else
    npm run isolated-test-rec
fi
./tests/wiremock/stop_recording.sh
./tests/wiremock/remove_sensitive_data.sh

npm run prettier-write
