# Isolated tests for sdk-backend-tiger with recordings

## Initiate and build the sdk

```
rush install
rush build -t sdk-backend-tiger
```

## Run the tests

Use `./scripts/isolated-test.sh` to run the tests with recordings

## Prepare recordings for tests

### Prepare workspace

```
SDK_BACKEND=TIGER
HOST=https://staging.dev-latest.stg11.panther.intgdc.com
TIGER_API_TOKEN=xxx
FIXTURE_TYPE=goodsales
TIGER_DATASOURCES_NAME=vertica_staging-goodsales
```

and run `rushx create-ref-workspaces`

### Store workspace id in proper files

The id of the workspace which was created needs to be set:

- tests/integrated/backend.ts (under function getRecordingsWorkspaceId)
- scripts/refresh-md.sh

### Create recordings

When workspace is ready, run

```
rushx refresh-md
GD_TIGER_REC=true ./scripts/isolated-test.sh
```

to update snapshots, run

```
GD_TIGER_REC=true UPDATE_SNAPSHOTS=true ./scripts/isolated-test.sh
```
