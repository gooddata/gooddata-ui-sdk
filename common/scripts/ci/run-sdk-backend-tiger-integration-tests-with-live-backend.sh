#!/bin/bash -i
set -ex

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}")/../../../ && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

NODE_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/node:22.13.0-bullseye'
NETWORK_ID=ui-sdk-network-$BUILD_ID
CYPRESS_HOST=$HOST
TIGER_API_TOKEN=$TIGER_API_TOKEN
FIXTURE_TYPE=$FIXTURE_TYPE
TIGER_DATASOURCES_NAME=$TIGER_DATASOURCES_NAME
IS_AIO=$IS_AIO
AIO_VERSION=$AIO_VERSION
EXTRA_PARAMS=""
CONTAINER_ID=gooddata-cn-ce-aio-${EXECUTOR_NUMBER}

$_RUSH install
$_RUSH build -t sdk-backend-tiger

log() {
  local now;
  now=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$now $*" 1>&2
}

health_check() {
  for ((i = 1; i <= 200; i++)); do
    log "Check AIO is up, try $i"
    if curl -f -s -H "Authorization: Bearer $TIGER_API_TOKEN" -H "Host: $CONTAINER_ID" "$HOST/api/v1/entities/admin/organizations/default" ; then
      return 0
    else
      sleep 3
    fi
  done
  return 1
}

function shutdownAIO() {
  log "Extracting logs from container $CONTAINER_ID"
  docker logs $CONTAINER_ID > AIO-logs.txt 2>&1
  log "Shutting down AIO! Stop docker ! Remove network"
  docker stop $CONTAINER_ID
  docker rm -f $CONTAINER_ID
  docker network rm $NETWORK_ID
}

if [[ "$IS_AIO" == true ]]; then
  DATA_LOADER_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/nas/data-loader:master'
  PORT_NUMBER=300${EXECUTOR_NUMBER}
  HOST=http://localhost:$PORT_NUMBER
  TEST_HOST=http://$CONTAINER_ID:$PORT_NUMBER
  CYPRESS_HOST=http://$CONTAINER_ID:3000
  TIGER_API_TOKEN=YWRtaW46Ym9vdHN0cmFwOmFkbWluMTIz
  TIGER_DATASOURCES_NAME=pg_staging-goodsales
  EXTRA_PARAMS=" --net=$NETWORK_ID "
  AIO_IMAGE="020413372491.dkr.ecr.us-east-1.amazonaws.com/nas/gooddata-cn-ce:$AIO_VERSION"

  trap shutdownAIO EXIT
  docker network create $NETWORK_ID

  docker run --name $CONTAINER_ID --pull always -e APP_LOGLEVEL=INFO -e GDCN_LICENSE_KEY \
      -e BUNDLE_TYPE=gdc -e GDCN_PUBLIC_URL=$TEST_HOST -p $PORT_NUMBER:3000 --net=$NETWORK_ID -d $AIO_IMAGE

  if ! health_check; then
    log "Can't run test, AIO services are not ready"
    exit 1
  fi

  docker run --rm \
  -e DB_HOST=$CONTAINER_ID \
  -e DB_PORT=5432 \
  -e DB_USER=demouser \
  -e DB_NAME=demo \
  -e DB_PASSWORDS="{'pg_local': 'demopass'}" \
  --entrypoint '' --net=$NETWORK_ID \
  $DATA_LOADER_IMAGE \
  /bin/bash -c "/data_load/data_load.py -w goodsales -d pg_local --debug  --skip-download --no-schema-versioning -f"

  curl $HOST/api/v1/entities/dataSources \
    -H "Content-Type: application/vnd.gooddata.api+json" \
    -H "Accept: application/vnd.gooddata.api+json" \
    -H "Authorization: Bearer $TIGER_API_TOKEN" \
    -H "Host: $CONTAINER_ID" \
    -X POST \
    -d '{
        "data": {
        "attributes": {
          "name": "pg_staging-goodsales",
          "url": "jdbc:postgresql://localhost:5432/demo",
          "schema": "goodsales",
          "type": "POSTGRESQL",
          "username": "demouser",
          "password": "demopass"
        },
        "id": "pg_staging-goodsales",
        "type": "dataSource"
      }
    }'
fi

pushd "${ROOT_DIR}" || exit 1

docker run --rm --entrypoint '' \
-e HOST=$CYPRESS_HOST \
-e TIGER_API_TOKEN=$TIGER_API_TOKEN \
-e FIXTURE_TYPE=$FIXTURE_TYPE \
-e TIGER_DATASOURCES_NAME=$TIGER_DATASOURCES_NAME \
$EXTRA_PARAMS \
-w /workspace/libs/sdk-backend-tiger -v "$(pwd)":/workspace $NODE_IMAGE \
sh -c "./scripts/run-integrated-with-workspace.sh" || exit 1
