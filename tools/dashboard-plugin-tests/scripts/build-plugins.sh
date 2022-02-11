#!/usr/bin/env bash

# TODO: RAIL-3888 support concurrency

rm -rf "./dist/plugins"

FILES="./plugins/*"
for f in $FILES
do
  plugin="$(basename -- $f)"
  cd $f
  echo "Building plugin \"$plugin\"..."
  npm run build-plugin
  cd -
  mkdir -p ./dist/plugins/$plugin
  mv $f/dist/dashboardPlugin/* ./dist/plugins/$plugin
done
