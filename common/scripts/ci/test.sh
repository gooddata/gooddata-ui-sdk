#!/bin/bash

#
# A bunch of poor-man's tests for the utils.sh. the functions are vital in decision making during releases.
#

source ./utils.sh

version=$(get_current_version)
prerelease=$(is_current_version_prerelease)

echo "current version: ${version}; is prerelease: ${prerelease}"

if [ ! $prerelease -eq 0 ]; then
  echo "it is indeed prerelease"
fi
