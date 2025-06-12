#!/bin/bash

_ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../.. && pwd -P))

function get_current_version {
  local retval=$(jq -r ".version" "${_ROOT_DIR}/libs/sdk-ui/package.json")
  echo "$retval"
}

#
# Returns 0 if current version is 'alpha' or 'beta'; otherwise 1.
#
function is_current_version_prerelease {
  version=$(get_current_version)
  retval=1

  case "$version" in
    *"alpha"*)
      retval=0
      ;;
    *"beta"*)
      retval=0
      ;;
  esac

  echo "$retval"
}

function get_release_commit_hash {
  version=$1

  echo $(git log --grep "^Release $version\$" --grep "[Bb]ump versions to $version\$" | sed 's/commit //g' | head -1)
}

log() {
  local now;
  now=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$now $*" 1>&2
}

health_check() {
  for ((i = 1; i <= 50; i++)); do
    log "Check $1 is up, try $i"
    if curl -k "$1" ; then
      return 0
    else
      sleep 3
    fi
  done
  return 1
}
