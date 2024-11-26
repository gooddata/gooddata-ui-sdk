#!/bin/bash

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)

APPLICATION=$1
RUNNER=$2
TAGS=$3
RUNNERS_COUNT=${4:-5}

cd "$DIR/../../../"

shopt -s globstar
shopt -s extglob

files=()
for file in ./libs/$APPLICATION/cypress/integration/**/*.ts; do
  if grep -qEw "$TAGS" "$file"; then
    filename="${file#*cypress/integration/}"
    files+=("$filename")
  fi
done

group_size=$(((${#files[@]} + RUNNERS_COUNT - 1) / RUNNERS_COUNT))
groups=()
for ((i=0; i<${#files[@]}; i+=group_size)); do
  group_files=("${files[@]:i:group_size}")
  group_string=$(printf "%s," "${group_files[@]}")
  group_string=${group_string%,} # remove trailing comma
  groups+=("$group_string")
done

number="${RUNNER##*[^0-9]}"
index=$((number - 1))
if [[ index -ge 0 && index -lt ${#groups[@]} ]]; then
  echo "${groups[index]}"
else
  echo "Index out of range for runner $RUNNER"
  exit 1
fi
