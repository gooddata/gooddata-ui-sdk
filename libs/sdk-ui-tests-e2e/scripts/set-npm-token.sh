#!/bin/bash

if [[ -z "${NPM_TOKEN}" ]]; then
  echo "NPM_TOKEN not provided, skipping 'npm config set' and assuming local usage which already has .npmrc"
  exit 0
else
  npm config set '//registry.npmjs.org/:_authToken' $NPM_TOKEN
fi
