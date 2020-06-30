#!/bin/bash

# Absolute root dir .. for the docker volumes
ROOT_DIR=$(echo $(cd $(dirname $0)/.. && pwd -P))

STORYBOOK_ASSETS="${ROOT_DIR}/dist-storybook"
STORYBOOK_CONF="${ROOT_DIR}/stories/storybook.conf"
BACKSTOP_DIR="${ROOT_DIR}/backstop"

# randomize network just in case two jobs run on the same machine
BACKSTOP_NET="backstop-sdk-ui-${RANDOM}"

UID=$(id -u)
GID=$(id -g)

echo "Creating docker network for the storybook & backstop to share: ${BACKSTOP_NET}"

docker network create "${BACKSTOP_NET}" || { echo "Network creation failed" && exit 1 ; }

{
    echo "Starting nginx container serving storybooks from ${STORYBOOK_ASSETS}"

    # Note: careful with the net-alias; it is used as hostname in scenarios.config.js
    NGINX_CONTAINER=$(docker run --rm \
        --detach \
        --net "${BACKSTOP_NET}" --net-alias storybook \
        --volume ${STORYBOOK_ASSETS}:/usr/share/nginx/html:ro,Z \
        --volume ${STORYBOOK_CONF}:/etc/nginx/conf.d/storybook.conf:ro,Z \
        nginx:1.17.6)

    echo "nginx container started: ${NGINX_CONTAINER}"

    # TODO Yea right.. nginx starts quite fast but this will ultimately fail on some overloaded slaves.
    sleep 2

    echo "Starting BackstopJS in dir ${BACKSTOP_DIR} with params: $@"

    {
        docker run --rm \
            --env BACKSTOP_CAPTURE_LIMIT \
            --env BACKSTOP_COMPARE_LIMIT \
            --user $UID:$GID \
            --net ${BACKSTOP_NET} --net-alias backstop \
            --volume ${BACKSTOP_DIR}:/src:Z backstopjs/backstopjs:4.5.1 \
            --config=/src/backstop.config.js "$@"

        echo "BackstopJS finished. Killing nginx container ${NGINX_CONTAINER}"
    }

    docker kill ${NGINX_CONTAINER}

    echo "Cleaning up docker network ${BACKSTOP_NET}"

    docker network rm "${BACKSTOP_NET}"
} || {
  echo "Error running backstop. Cleaning up network: ${BACKSTOP_NET}"

  docker network rm "${BACKSTOP_NET}"
}

