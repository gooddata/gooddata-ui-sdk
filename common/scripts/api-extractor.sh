#!/bin/bash

#
# This script iterates through predefined set of projects and runs api-extractor in them
#

PROJECT_ROOT=`pwd`
API_EXTRACTOR="${PROJECT_ROOT}/common/temp/node_modules/.bin/api-extractor"
API_DOCUMENTER="${PROJECT_ROOT}/common/temp/node_modules/.bin/api-documenter"
PROJECTS=("libs/gooddata-react-components")

for PROJECT in ${PROJECTS} ; do
    cd ${PROJECT}
    ${API_EXTRACTOR} run
    if [[ ! -d "etc" ]]
    then
        mkdir etc
    fi
    cp temp/*.api.md etc/
    cd ${PROJECT_ROOT}
done
