#!/usr/bin/env bash

# TODO: support concurrency

FILES="./plugins/*"
for f in $FILES
do
  plugin="$(basename -- $f)"
  cd $f
  echo "Installing plugin \"$plugin\"..."
  npm install --legacy-peer-deps --loglevel=error
  cd -
done
