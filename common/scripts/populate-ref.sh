#!/bin/bash

echo "Running populate-ref in sdk-ui-tests-scenarios"
cd libs/sdk-ui-tests-scenarios
rushx populate-ref

cd ../../tools/reference-workspace
rushx format-write
