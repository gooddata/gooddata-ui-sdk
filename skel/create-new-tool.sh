#!/bin/bash

#
# Bail out early if there are unstaged changes changing around - do not want to commit those together with the
# new package code & changes.
#
git diff-index --quiet HEAD -- || (echo "There are uncommitted changes. Please commit or stash changes first" && exit 1)

if [[ "$#" -ne 2 ]]; then
    echo "Syntax: create-new-tool.sh <ts|tsx> <tool-name>"
    exit 1
fi

skeleton="sdk-skel-${1}"

if [[ ! -d ${skeleton} ]]; then
    echo "Skeleton project ${skeleton} does not exist."
    exit 1
fi;

newtool_name="${2}"
newtool_dir="../tools/${newtool_name}"

if [[ -d ${newtool_dir} ]]; then
    echo "SDK already has library ${newtool_name}; Directory exists: ${newtool_dir}"
    exit 1
fi;

echo "Creating new directory ${newtool_dir}"
mkdir ${newtool_dir}

#
# Copy everything except node_modules and dist
#
for item in `ls -A ${skeleton} | grep -Ev "node_modules|dist"`; do
    echo "Copying ${item}..."
    cp -r ${skeleton}/${item} ${newtool_dir}/
done;

#
# Update api-extractor file to match library name
#
newtool_api_original="${newtool_dir}/api/${skeleton}.api.md"
newtool_api="${newtool_dir}/api/${newtool_name}.api.md"

echo "Setting name in ${newtool_api} to ${newtool_name}"
sedexp="s/${skeleton}/${newtool_name}/g"
sed "${sedexp}" ${newtool_api_original} >${newtool_api}
rm "${newtool_api_original}"

#
# Update package.json to match library name
#
newtool_package="${newtool_dir}/package.json"

echo "Setting name in ${newtool_package} to ${newtool_name}"

# First, update repository field in package.json to use correct directory
sedexp="s/libs\/${skeleton}/tools\/${skeleton}/g"
sed "${sedexp}" ${newtool_package} >${newtool_package}.new
mv ${newtool_package}.new ${newtool_package}

# And then perform the renaming
sedexp="s/${skeleton}/${newtool_name}/g"
sed "${sedexp}" ${newtool_package} >${newtool_package}.new
mv ${newtool_package}.new ${newtool_package}

#
# Add new tool package into rush.json
#
echo "Adding new entry to rush.json"
newtool_entry=" \"projects\": \[    {\"packageName\": \"@gooddata\/${newtool_name}\",\"projectFolder\": \"tools\/${newtool_name}\",\"reviewCategory\": \"tools\", \"shouldPublish\": false},"
sed "s/\"projects\": \[/${newtool_entry}/" ../rush.json > ../rush.json.new
mv ../rush.json.new ../rush.json
../common/temp/node_modules/.bin/prettier --write '../rush.json'

rush update || echo "Rush update has failed. Stopping now. Please fix it up and and then do commit & fixup"
git add ${newtool_dir}
git add ../common
git add ../rush.json
git commit -m "Initialize new SDK tool ${newtool_name}"
