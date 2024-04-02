# Reference Workspace for tests

[![npm version](https://img.shields.io/npm/v/@gooddata/reference-workspace)](https://www.npmjs.com/@gooddata/reference-workspace)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/reference-workspace)](https://npmcharts.com/compare/@gooddata/reference-workspace?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This project defines LDM and test data recordings to use for all types of tests in GoodData.UI SDK. The
LDM and recordings are obtained from a live workspace in a GoodData Platform.

## How to create reference workspace

Workspace can be created by script import-ref-workspace running `npm run import-ref-workspace`.

All scripts are defined in `reference-workspace-mgmt` package.

Import is using `@gooddata/fixtures`package.

Workspace metadata like Dashboards, visualization etc are defined in `/reference-workspace-mgmt/fixtures/tiger_metadata_extension.json`
This json is source of true of reference workspace that is than recorded.

You need to set `/reference-workspace-mgmt/.env` file and defined variables. Use `/reference-workspace-mgmt/.env.template`

`WORKSPACE_ID` will be automatically updated in .env file after success import.

## How to export reference workspace

After your changes in live workspace you need to export workspace into `/reference-workspace-mgmt/fixtures/tiger_metadata_extension.json`

by command `npm run export-ref-workspace` and commit changes to git.

All scripts are defined in `reference-workspace-mgmt` package.

## How to create/ update recordings

NOTE: you need set TIGER_API_TOKEN and HOST_NAME and WORKSPACE_ID in `/reference-workspace-mgmt/.env`

All recordings are defined in `reference-workspace/src/recordings` directory

### Update Catalogue

In dir `src/md` theres is defined standard GD catalog to update it call `npm run refresh-md` and build `refresh-md` package.

### Update recordings metadata

NOTE: you need set TIGER_API_TOKEN and HOST_NAME and WORKSPACE_ID in `/reference-workspace-mgmt/.env`

In `/reference-workspace/src/recordings/metadata` are recorded workspace metadata, like Dashboards, Catalog, Display Forms and list of VisClasses.

### Update recordings metadata catalog

Just delete `src/recordings/metadata/catalog` and rush `npm run refresh-recordings` script will record fresh recordings

### Update recordings metadata dashboard

In `dashboards.json` is defined list of recorded dashboard, to update recording just delete corresponding directory named by dashboard GUID
and run `npm run refresh-recordings`

To record new dashboard just add item to `dashboards.json`

NOTE: Do not try delete or update empty dashboard its hardcoded dashboard and this dashboard not exists in reference workspace

### Update recordings metadata displayForms

In displayForms.json there is list of recorded display forms, each display form record its definition and also its elements.
In case display forms has large amount of elements you can defined limit like `{ "elementCount": 10 }`

To update recording just delete corresponding directory named by display forms id and run `npm run refresh-recordings`
To record new dashboard just add item to `displayForms.json`

### Update recordings metadata visClasses

Just delete visClasses dir and run `npm run refresh-recordings`

### Update uiTestScenarios

In dir `src/recordings/uiTestScenarios` are defined recordings for storybook scenarios (sdk-ui-tests)

To update this recordings run

`rush build`
`npm run clear-recordings`
`npm run populate-ref` (script defined in sdk-ui-tests must be run from this dir) see readme there
`npm run refresh-recordings`

## Working with reference workspace LDM

This is stored in [src/md](src/md) and consists of two files:

-   The auto-generated `full.ts` - this is created by running `npm run refresh-md` script

    Note: the script has an existing workspace hardcoded; either ask for access to this workspace or
    change the script to use your own workspace.

-   The `ext.ts` file holding extensions to the standard LDM - this is where we store custom LDM
    and analytical objects built on top of the standard objects. For instance PoP measures,
    Previous Period Measures, Arithmetic Measures and so on.

    Note: the objects in `ext.ts` MUST be related to the reference workspace. We do not want 'dummy', 'mock'
    and other types of 'fake' declarations.

## Working with recordings

#### Executions

Execution recordings fall under [src/recordings/executions](src/recordings/executions) directory. Each
execution recording MUST be stored in its own directory. The recording directories can be organized in
any way we see fit. Note: the `uiTestScenarios` directory is managed via automation, you MUST NOT
store any custom recordings here - because they WILL be lost.

The rules for recording entries are as follows:

-   Unique recordings MUST be stored in a directory named after _fingerprint_ of their execution definition
    -   This can be obtained using `defFingerprint` function
-   The `definition.json` file MUST exist and MUST contain a valid execution definition
    -   This can be obtained by serializing the `IExecutionDefinition` to JSON
-   On top of this you MAY specify two additional metadata files:
    -   `scenarios.json` - this should contain an array of `{ vis: string, scenario: string }` objects. If present,
        it will be used to create `Scenarios` mapping in the recording index. This mapping is useful
        for tests that need to work with full execution result / data view but do not want to concern
        themselves with driving execution through recordedBackend()
    -   `requests.json` - this should contain an object that specifies what data views should be obtained
        and stored. Sometimes tests need all the data from backend, sometimes they work with particular
        windows. This is specified here. Check out existing files in `uiTestScenarios` for examples.

Once you create this, run `npm run refresh-md` script. This will invoke the mock handling tool to obtain the
data from the live reference workspace.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/reference-workspace/LICENSE).
