# Reference Workspace for Tests

[![npm version](https://img.shields.io/npm/v/@gooddata/reference-workspace)](https://www.npmjs.com/@gooddata/reference-workspace)
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/reference-workspace)](https://npmcharts.com/compare/@gooddata/reference-workspace?minimal=true)
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html). To learn more, go to the [source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This project defines a Logical Data Model (LDM) and test data recordings for use in various tests within the GoodData.UI SDK. The LDM and recordings are sourced from a live workspace in the GoodData Platform.

## Creating the Reference Workspace

To create a reference workspace, set up the `/reference-workspace-mgmt/.env` file and define variables using the template at `/reference-workspace-mgmt/.env.template`.

After a successful import, the `WORKSPACE_ID` will be automatically updated in the `.env` file.

To create the workspace, run the `import-ref-workspace` script using `npm run import-ref-workspace`. All scripts are defined in the `reference-workspace-mgmt` package.

The import process uses the `@gooddata/fixtures` package.

Workspace metadata, such as dashboards and visualizations, are defined in `/reference-workspace-mgmt/fixtures/tiger_metadata_extension.json`. This JSON file serves as the source of truth for the reference workspace.

## Exporting the Reference Workspace

After making changes in the live workspace, you need to export the workspace into the `/reference-workspace-mgmt/fixtures/tiger_metadata_extension.json` file by running the `npm run export-ref-workspace` command and committing the changes to Git.

All scripts are defined in the `reference-workspace-mgmt` package.

## Creating and Updating Recordings

### Prerequisites

Set the `TIGER_API_TOKEN`, `HOST_NAME`, and `WORKSPACE_ID` in the `/reference-workspace-mgmt/.env` file.

All recordings are defined in the `reference-workspace/src/recordings` directory.

### Updating the Catalog

The standard GoodData catalog is defined in the `src/md` directory. To update it, run the `npm run refresh-md` command and build the `refresh-md` package.

### Updating Recordings Metadata

Workspace metadata, such as dashboards, catalogs, display forms, and visualization classes, are recorded in the `/reference-workspace/src/recordings/metadata` directory.

To update the recording metadata:

- **Catalog**: Delete the `src/recordings/metadata/catalog` directory and run the `npm run refresh-recordings` script to record fresh data.
- **Dashboards**: Delete the corresponding directory (named by dashboard GUID) in the `dashboards.json` file and run `npm run refresh-recordings`. To record a new dashboard, add an entry to `dashboards.json`.
- **Display Forms and Elements**: In `displayForms.json`, list the display forms to be recorded. Each display form includes its definition and associated elements. If a display form contains many elements, you can set a limit, such as { "elementCount": 10 }.To update a recording, delete the directory named after the display form’s ID and run `npm run refresh-recordings`. To record a new display form, add it to displayForms.json.
- **Visualization Classes**: Delete the `visClasses` directory and run `npm run refresh-recordings`.

**NOTE:**Do not try to delete or update the empty hardcoded dashboard, as it does not exist in the reference workspace.

### Updating UI Test Scenarios

The `src/recordings/uiTestScenarios` directory defines recordings for storybook scenarios (sdk-ui-tests). To update these recordings, follow these steps:

1. Run `rush build`.
2. Run `npm run clear-recordings`.
3. Run `npm run populate-ref` (from the sdk-ui-tests directory).
4. Run `npm run refresh-recordings`.

## Working with Reference Workspace LDM

The Logical Data Model (LDM) is stored in the [src/md](src/md) directory and consists of two files:

- **full.ts**: An auto-generated file created by running the `npm run refresh-md` script.

    > Note: The script is hardcoded with an existing workspace. You may need to request access to this workspace or modify the script to use your own.

- **ext.ts**: A file holding extensions to the standard LDM. This file stores custom LDM and analytical objects built on top of standard objects, such as PoP measures, Previous Period Measures, and Arithmetic Measures.
    > Note: Objects in `ext.ts` must be related to the reference workspace. Avoid using dummy or mock declarations.

## Working with Recordings

### Executions

Execution recordings are in the [src/recordings/executions](src/recordings/executions) directory. Each execution recording must be stored in its own directory. The directories can be organized as needed.

> **Note:** The `uiTestScenarios` directory is managed via automation. Do not store custom recordings here, as they will be overwritten.

Rules for recording entries:

- **Unique Recordings**: Must be stored in a directory named after the fingerprint of their execution definition (obtained using the `defFingerprint` function).
- **definition.json**: Must exist and contain a valid execution definition (obtained by serializing the `IExecutionDefinition` to JSON).
- **Optional Metadata Files**:
    - `scenarios.json`: Contains an array of `{ vis: string, scenario: string }` objects to create a `Scenarios` mapping in the recording index.
    - `requests.json`: This specifies which data views to obtain and store. Examples are in the `uiTestScenarios` directory.

After creating this, run the `npm run refresh-md` script to obtain data from the live reference workspace.

## License

(C) 2017-2024 GoodData Corporation

This project is licensed under the MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/reference-workspace/LICENSE).
