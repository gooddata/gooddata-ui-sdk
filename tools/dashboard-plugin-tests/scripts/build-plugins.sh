#!/usr/bin/env bash

echo Removing plugins build folder...
rm -rf "./dist/plugins"

FILES="./plugins/*"
for f in $FILES
do
  plugin="$(basename -- $f)"
  echo Building plugin \"$plugin\"...
  cd $f
  npm run build-plugin

  if [ $? -eq 0 ]; then
    cd -
    mkdir -p ./dist/plugins/$plugin
    echo Moving plugin \"$plugin\" to the target destination...
    mv $f/dist/dashboardPlugin/* ./dist/plugins/$plugin
  else
      echo Plugin "$plugin" build failed!
  fi
done
