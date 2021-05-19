#!/bin/bash

#
# Bail out early if there are unstaged changes changing around - do not want to commit those together with the
# new package code & changes.
#
git diff-index --quiet HEAD -- || (echo "There are uncommitted changes. Please commit or stash changes first" && exit 1)

if [[ "$#" -ne 2 ]]; then
    echo "Syntax: create-new-lib.sh <ts|tsx> <library_name>"
    exit 1
fi

skeleton="sdk-skel-${1}"

if [[ ! -d ${skeleton} ]]; then
    echo "Skeleton project ${skeleton} does not exist."
    exit 1
fi;

newlib_name="${2}"
newlib_dir="../libs/${newlib_name}"

if [[ -d ${newlib_dir} ]]; then
    echo "SDK already has library ${newlib_name}; Directory exists: ${newlib_dir}"
    exit 1
fi;

echo "Creating new directory ${newlib_dir}"
mkdir ${newlib_dir}

#
# Copy everything except node_modules and dist
#
for item in `ls -A ${skeleton} | grep -Ev "node_modules|dist"`; do
    echo "Copying ${item}..."
    cp -r ${skeleton}/${item} ${newlib_dir}/
done;

#
# Update api-extractor file to match library name
#
newlib_api_original="${newlib_dir}/api/${skeleton}.api.md"
newlib_api="${newlib_dir}/api/${newlib_name}.api.md"

echo "Setting name in ${newlib_api} to ${newlib_name}"
sedexp="s/${skeleton}/${newlib_name}/g"
sed "${sedexp}" ${newlib_api_original} >${newlib_api}
rm "${newlib_api_original}"

#
# Update package.json to match library name
#
newlib_package="${newlib_dir}/package.json"

echo "Setting name in ${newlib_package} to ${newlib_name}"
sedexp="s/${skeleton}/${newlib_name}/g"
sed "${sedexp}" ${newlib_package} >${newlib_package}.new
mv ${newlib_package}.new ${newlib_package}

#
# Add new lib package into rush.json
#
echo "Adding new entry to rush.json"
newlib_entry=" \"projects\": \[    {\"packageName\": \"@gooddata\/${newlib_name}\",\"projectFolder\": \"libs\/${newlib_name}\",\"reviewCategory\": \"production\", \"versionPolicyName\": \"sdk\" },"
sed "s/\"projects\": \[/${newlib_entry}/" ../rush.json > ../rush.json.new
mv ../rush.json.new ../rush.json
../common/temp/node_modules/.bin/prettier --write '../rush.json'

rush update || echo "Rush update has failed. Stopping now. Please fix it up and and then do commit and fixup"
git add ${newlib_dir}
git add ../common
git add ../rush.json
git commit -m "Initialize new SDK package ${newlib_name}"
