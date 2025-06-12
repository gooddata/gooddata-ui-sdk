## Initial setup

Setup NVM with `nvm use`

Create `.env` file in the parent directory based on `.env.template`

Setup variables for backend you want to work with.

## Export metadata from existing workspace to fixture

The script takes measures, insights, and dashboards along with their dependencies
from an existing project exports them as fixture JSON file.
Then only objects which are new/modified in comparison to the objects in original fixture are detected.
Diff objects are stored in `FIXTURE_TYPE/tiger_metadata_extension.json`.
The file can be used to update metadata definition in a fixture according to a real workspace.
Make sure the real workspace is based on the fixture to be updated.
The source workspace is specified by SOURCE_WORKSPACE_ID in the `.env` file.

## Create workspace

The script creates a new workspace based on provided fixture defined by `FIXTURE_TYPE`,
adds extra MD objects from `FIXTURE_TYPE/tiger_metadata_extension.json`
and extends the `.env` file with `TEST_WORKSPACE_ID`
`./create_ref_workspace.js`

TIGER: to connect LDM to the corresponding data source you need to specify `TIGER_DATASOURCES_NAME` too.

## Delete workspace

Deletes workspace specified by `TEST_WORKSPACE_ID` in the `.env` file.
After that the record TEST_WORKSPACE_ID is removed from the `.env` file.
`./delete_ref_workspace.js`

## Clean up Expired Tiger workspace

Delete all workspaces older than 2 hours.
`./cleanup_tiger_workspaces.js`
