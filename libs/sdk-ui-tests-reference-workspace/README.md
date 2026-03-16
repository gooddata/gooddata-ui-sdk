# SDK Reference Workspace

This package manages reference workspaces used by GoodData.UI SDK tests. It provides scripts for creating, deleting, and exporting workspaces and their fixtures.

## Initial setup

Setup NVM with `nvm use`

Create `.env` file based on `.env.template` and setup variables for the backend you want to work with.

### Environment variables

```
export TEST_BACKEND=https://abc.your-domain.com
export TEST_BACKEND_NO_PREFIX=abc.your-domain.com
export HOST=$TEST_BACKEND
```

Required `.env` variables:

- `FIXTURE_TYPE=goodsales`
- `TIGER_API_TOKEN=`
- `TIGER_DATASOURCES_NAME=` (needed to connect LDM to the corresponding data source)

## Reference workspace

The reference workspace contains LDM, data, dashboards, insights and other metadata objects.
It's based on the fixture defined in `FIXTURE_TYPE` (`goodsales` if not defined) env variable and extended with metadata objects specific for tests.

### Create workspace

The script creates a new workspace based on the provided fixture defined by `FIXTURE_TYPE`,
adds extra MD objects from `FIXTURE_TYPE/tiger_metadata_extension.json`
and extends the `.env` file with `TEST_WORKSPACE_ID` and `TEST_CHILD_WORKSPACE_ID`.

```
rushx create-ref-workspace
```

TIGER: to connect LDM to the corresponding data source you need to specify `TIGER_DATASOURCES_NAME` too.

After running `create-ref-workspace`, copy the generated `TEST_WORKSPACE_ID` and `TEST_CHILD_WORKSPACE_ID` values from this package's `.env` file into the `.env` files of `sdk-ui-tests-app` and `sdk-ui-tests-e2e`.

### Update workspace

Update your reference workspace after each rebase:

```
rushx update-ref-workspace
```

Current workspace ID will be automatically added to the `.env` file as `TEST_WORKSPACE_ID`.

### Delete workspace

Deletes workspace specified by `TEST_WORKSPACE_ID` in the `.env` file.
After that the record `TEST_WORKSPACE_ID` is removed from the `.env` file.

```
rushx delete-ref-workspace
```

### Clean up expired Tiger workspaces

Delete all workspaces older than 2 hours.

```
node ./lib/cleanup_tiger_workspaces.js
```

## Fixture export and update

The fixture is imported from the `@gooddata/fixtures` package.

### Export metadata from existing workspace to fixture

The script takes measures, insights, and dashboards along with their dependencies
from an existing project and exports them as a fixture JSON file.
Then only objects which are new/modified in comparison to the objects in the original fixture are detected.
Diff objects are stored in `FIXTURE_TYPE/tiger_metadata_extension.json`.
The file can be used to update metadata definition in a fixture according to a real workspace.
Make sure the real workspace is based on the fixture to be updated.
The source workspace is specified by `SOURCE_WORKSPACE_ID` in the `.env` file.

```
rushx export-fixture
```

## Workspace objects

The `workspace_objects/` directory contains exported TypeScript catalog files with identifiers of metadata objects:

- `current_reference_workspace_objects_bear.ts`
- `current_reference_workspace_objects_tiger.ts`
- `current_child_reference_workspace_objects_tiger.ts`

These are imported by other packages (e.g. `sdk-ui-tests-app`, `sdk-ui-tests-e2e`) to reference workspace metadata in code.

## Prepare recording workspace ID

Updates `workspace_id` in record mapping file to `.env`:

```
rushx prepare-recording-workspace-id
```
