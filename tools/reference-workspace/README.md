# Reference Workspace for tests

This project defines LDM and test data recordings to use for all types of tests in GoodData.UI SDK. The
LDM and recordings are obtained from a live workspace in a GoodData Platform.

## How to create reference workspace (GD-only for now)

The reference workspace is created by deploying a GoodSales/2 fixture from gdc-test-fixtures:

1.  Clone the gdc-test-fixtures repository

2.  Navigate to tools directory, execute `zip_upload.sh ../fixtures/GoodSales/2`
    This will prepare upload.zip that is input to GoodData ETL Pull API

3.  Use either JavaScript or Python tooling with appropriate command line args to create a new workspace
    using the GoodSales/2 fixture

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

### How to create a new recording

This really depends on _what_ is it that you want to record in the workspace.

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
