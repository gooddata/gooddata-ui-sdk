#!/bin/bash

# make sure the repo has run rush install before the FOSSA scanning

echo 'Running rush install for FOSSA...'

node "./common/scripts/install-run-rush.js" install

echo 'Done running rush install for FOSSA'
