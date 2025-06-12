#!/bin/bash

# Absolute root dir .. for the docker volumes
ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))

STORYBOOK_ASSETS="${ROOT_DIR}/dist-storybook"
STORYBOOK_CONF="${ROOT_DIR}/stories/storybook.conf"
PORT=${1:-"8666"}

echo "Starting nginx to serve contents of dist-storybook on localhost:${PORT}."

docker run --rm \
        --volume ${STORYBOOK_ASSETS}:/usr/share/nginx/html:ro,Z \
        --volume ${STORYBOOK_CONF}:/etc/nginx/conf.d/storybook.conf:ro,Z \
        -p ${PORT}:8080 \
        nginxinc/nginx-unprivileged:1.21.6-alpine
