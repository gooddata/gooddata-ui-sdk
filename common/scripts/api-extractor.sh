#!/bin/bash

#
# This script iterates through predefined set of projects and runs api-extractor in them
#
# TODO: SDK8: have something like this run as part of each package build
#

PROJECT_ROOT=`pwd`
API_EXTRACTOR="${PROJECT_ROOT}/common/temp/node_modules/.bin/api-extractor"
API_DOCUMENTER="${PROJECT_ROOT}/common/temp/node_modules/.bin/api-documenter"
PRETTIER="${PROJECT_ROOT}/common/temp/node_modules/.bin/prettier"
PROJECTS=("libs/sdk-model")

for PROJECT in ${PROJECTS} ; do
    cd ${PROJECT}

    #
    # Run api extractor according to the config in the current directory
    #
    ${API_EXTRACTOR} run

    #
    # Copy created API report
    #
    if [[ ! -d "api" ]]
    then
        mkdir "api"
    fi
    cp temp/*.api.md api/

    #
    # Run prettier on the api report now to prevent false-positive change on the report file
    #
    $PRETTIER --write 'api/*.{ts,tsx,json,scss,md,yaml,html}'
    cd ${PROJECT_ROOT}
done
