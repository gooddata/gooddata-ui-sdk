#!/bin/bash -i
set -ex

export EXECUTOR_NUMBER=1
#

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR="${DIR}/../../../"
NODE_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-node-16:node-16.13.0-yarn-1.22.17'
export IMAGE_ID=gooddata-cn-ce-aio-${EXECUTOR_NUMBER}
export NETWORK_ID=aio-net-${EXECUTOR_NUMBER}
export PORT_NUMBER=300${EXECUTOR_NUMBER}
export HOST=http://localhost:$PORT_NUMBER
export TEST_HOST=http://$IMAGE_ID:$PORT_NUMBER
export TIGER_API_TOKEN=YWRtaW46Ym9vdHN0cmFwOmFkbWluMTIz
export TIGER_DATASOURCES_NAME=pg_staging-goodsales
export IS_AIO=true

log() {
  local now;
  now=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$now $*" 1>&2
}

health_check() {
  for ((i = 1; i <= 200; i++)); do
    log "Check AIO is up, try $i"
    if curl -f -s -H "Authorization: Bearer $TIGER_API_TOKEN" -H "Host: $IMAGE_ID" "$HOST/api/v1/entities/admin/organizations/default" ; then
      return 0
    else
      sleep 3
    fi
  done
  return 0
}

function gracefulShutdown() {
  log "Shutting down! Stop docker ! Remove network"
  docker stop $IMAGE_ID
  docker rm -f $IMAGE_ID
  docker network rm $NETWORK_ID
}

if [[ "$IS_AIO" == true ]]; then
  trap gracefulShutdown EXIT

  docker network create $NETWORK_ID

  docker run -it --name $IMAGE_ID -e APP_LOGLEVEL=INFO -e LICENSE_AND_PRIVACY_POLICY_ACCEPTED=YES \
      -e BUNDLE_TYPE=gdc -e GDCN_PUBLIC_URL=$TEST_HOST -p $PORT_NUMBER:3000 --net=$NETWORK_ID -d gooddata/gooddata-cn-ce:2.2.0

  if ! health_check; then
    log "Can't run test, AIO services are not ready"
    exit 1
  fi

  docker run -it --rm \
  -e DB_HOST=$IMAGE_ID \
  -e DB_PORT=5432 \
  -e DB_USER=demouser \
  -e DB_NAME=demo \
  -e DB_PASSWORDS="{'pg_local': 'demopass'}" \
  --entrypoint '' --net=$NETWORK_ID \
  441851189095.dkr.ecr.eu-central-1.amazonaws.com/nas/data-loader:master \
  /bin/bash -c "/data_load/data_load.py -w goodsales -d pg_local --debug  --skip-download --no-schema-versioning -f"

  curl $HOST/api/v1/entities/dataSources \
    -H "Content-Type: application/vnd.gooddata.api+json" \
    -H "Accept: application/vnd.gooddata.api+json" \
    -H "Authorization: Bearer $TIGER_API_TOKEN" \
    -H "Host: $IMAGE_ID" \
    -X POST \
    -d '{
        "data": {
        "attributes": {
          "cachePath": ["TIGER_CACHE"],
            "enableCaching": false,
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

  pushd "${ROOT_DIR}" || exit 1

  docker run -it --rm \
  -e HOST=http://$IMAGE_ID:3000 \
  -e TIGER_API_TOKEN=$TIGER_API_TOKEN \
  -e SDK_BACKEND=TIGER \
  -e TIGER_DATASOURCES_NAME=$TIGER_DATASOURCES_NAME \
  --net=$NETWORK_ID \
  -w /workspace/libs/sdk-backend-tiger -v "$(pwd)":/workspace $NODE_IMAGE \
  sh -c "./scripts/run-integrated-with-workspace.sh" || exit 1
fi
