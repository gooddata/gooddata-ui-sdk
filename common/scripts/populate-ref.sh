#!/bin/bash

echo "Running populate-ref in sdk-ui-tests"
cd libs/sdk-ui-tests
rushx populate-ref

cd ../../tools/reference-workspace
rushx prettier-write

cd ../live-examples-workspace
rushx prettier-write

cd ../experimental-workspace
rushx prettier-write
