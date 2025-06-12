#!/bin/bash

# If the build cache is enabled, we need to run the build-dynamic-files command
# to generate the dynamic files like __version.ts and conversion localizations JSON files to TS files.
if [ "$RUSH_BUILD_CACHE_ENABLED" = "1" ]; then
    rush build-dynamic-files
fi
