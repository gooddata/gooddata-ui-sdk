#!/bin/bash
echo "Please input documentation version (ex. 8.3.0 or 'Next' for prerelease documentation):"
read VERSION
echo "Start creating docs v${VERSION}"

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR="${DIR}/../.."

API_DOCUMENTER_BIN="${ROOT_DIR}/common/temp/node_modules/@microsoft/api-documenter/bin/api-documenter"
APIDOC_DIR="${ROOT_DIR}/../gooddata-ui-apidocs"
APIDOC_DIR_VERSIONED="${ROOT_DIR}/../gooddata-ui-apidocs/v${VERSION}"
APIDOCS_VERSION_LIST="${ROOT_DIR}/../gooddata-ui-apidocs/versions.json"
APIDOC_DIR_DOCS="${APIDOC_DIR_VERSIONED}/docs"
APIDOC_INPUT_DIR="${APIDOC_DIR_VERSIONED}/input"
SIDEBAR="${APIDOC_DIR_VERSIONED}/website/sidebars.json"
VERSION_FILE="${APIDOC_DIR_VERSIONED}/website/version.json"

BUILD_OUT="${APIDOC_DIR_VERSIONED}/build-docs.log"
BUILD_ERR="${APIDOC_DIR_VERSIONED}/build-docs.err"

rm -rf "${APIDOC_DIR}/v${VERSION}"
cp -rf "${APIDOC_DIR}/_template" "${APIDOC_DIR}/v${VERSION}"

rm -rf "${APIDOC_DIR_DOCS}"
mkdir -p "${APIDOC_INPUT_DIR}"
jq -n '{"Docs": {}}' > $SIDEBAR
jq --arg version ${VERSION} -n '{version: $version}' > $VERSION_FILE

if [ $VERSION != "Next" ]
then
    cat ${APIDOCS_VERSION_LIST} | jq --arg version ${VERSION} 'if index( [$version] ) == null then . += [$version] else . end' $APIDOCS_VERSION_LIST > temp && mv temp $APIDOCS_VERSION_LIST  
fi

cp ${ROOT_DIR}/libs/*/temp/*.api.json "${APIDOC_INPUT_DIR}"

echo "Starting api-documenter. Generated files will be stored in apidocs/docs. Generator outputs routed to apidocs/build-docs.log and apidocs/build-docs.err."

"${API_DOCUMENTER_BIN}" markdown --input-folder "${APIDOC_INPUT_DIR}" --output-folder ${APIDOC_DIR_DOCS} 1>"${BUILD_OUT}" 2>"${BUILD_ERR}"

echo "Starting docs sanitization"
for filename in $APIDOC_DIR_DOCS/*; do
     FILE="${filename}"
     FILE_NAME="${filename##*/}"
     FILE_NAME_WITHOUT_EXTENSION=${FILE_NAME%.*}
     IFS='.' read -ra FILE_NAME_ARRAY <<< "$FILE_NAME_WITHOUT_EXTENSION"
     LIB=${FILE_NAME_ARRAY[0]}
     LIBS_TO_BE_REMOVED=("sdk-ui-kit" "sdk-backend-base" "sdk-backend-bear" "sdk-backend-tiger" "api-model-bear" "api-client-tiger" "api-client-bear" "sdk-backend-mockingbird" "sdk-embedding")

    if [[ " ${LIBS_TO_BE_REMOVED[@]} " =~ " ${LIB} " ]]
    then
        rm $FILE
    fi
done
echo "Sanitization done"

echo "Starting to add front matter to markdown files and data to sidebars.json"
for filename in $APIDOC_DIR_DOCS/*; do
    FILE_NAME="${filename##*/}"
    FILE_NAME_WITHOUT_EXTENSION=${FILE_NAME%.*}
    IFS='.' read -ra FILE_NAME_ARRAY <<< "$FILE_NAME_WITHOUT_EXTENSION"
    TITLE_NOT_SANITIZED=$(grep -m 1 \#\# ${filename})
    TITLE_SANITIZED=${TITLE_NOT_SANITIZED//#/}
    IFS=' ' read -ra TITLE_ARRAY <<< "$TITLE_SANITIZED"

    if [[ ${TITLE_ARRAY[0]} = *"."* ]]
    then
        IFS='.' read -ra TITLE_ARRAY <<< "${TITLE_ARRAY[0]}"
        FINAL_TITLE="${TITLE_ARRAY[${#TITLE_ARRAY[@]} - 1]}"
    else
        FINAL_TITLE=${TITLE_ARRAY[0]}
    fi

    if [[ ${#FILE_NAME_ARRAY[@]} -eq 2 ]]
    then 
        cat $SIDEBAR | jq --arg FIELD ${FILE_NAME_ARRAY[0]} 'if .Docs | has($FIELD) | not then .Docs += {($FIELD): [($FIELD)]} else . end' $SIDEBAR > temp && mv temp $SIDEBAR
        cat $SIDEBAR | jq --arg FIELD ${FILE_NAME_ARRAY[0]} --arg FIELD_DATA $FILE_NAME_WITHOUT_EXTENSION 'if .Docs[$FIELD] | index( [$FIELD_DATA] ) == null then .Docs[$FIELD] += [$FIELD_DATA] else . end' $SIDEBAR > temp && mv temp $SIDEBAR    
    fi

     if [[ ${#FILE_NAME_ARRAY[@]} -eq 1 ]]
     then
        FINAL_TITLE="Overview of ${FINAL_TITLE}"
     fi

    echo "---
id: $FILE_NAME_WITHOUT_EXTENSION
title: $FINAL_TITLE
sidebar_label: $FINAL_TITLE
---"| cat - $filename > temp && mv temp $filename

sed 's/\\|/\&#124;/g; s/\\\[/[/g; s/\\\]/]/g' $filename > temp; mv temp $filename
done

cd "${APIDOC_DIR_VERSIONED}/website" && yarn install && yarn build
cd "${APIDOC_DIR_VERSIONED}/website" && mv build/* ../
cd "${APIDOC_DIR_VERSIONED}" && shopt -s extglob 
cd "${APIDOC_DIR_VERSIONED}" && rm -rf !(gooddata-ui-apidocs)
cd "${APIDOC_DIR_VERSIONED}" && mv gooddata-ui-apidocs/* . && rm -rf gooddata-ui-apidocs
