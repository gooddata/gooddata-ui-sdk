#!/usr/bin/env bash

echo Removing build folder...
rm -rf ./dist
mkdir -p ./dist

echo Running webpack build of the plugin loader...
node_modules/.bin/webpack --config plugins-loader/webpack.config.js

if [ $? -eq 0 ]; then
    echo Moving plugin loader to the target destination...
    mv plugins-loader/dist/* ./dist
else
    echo Plugin loader build failed!
fi
