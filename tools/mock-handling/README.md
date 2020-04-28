# GoodData Mock Handling Tool

The CLI tool in this project aims to automate capture and management of test data.

## Overview

Given an recording directory, mock tooling with traverse the directory, looking for definitions of data to retrieve
from live backend and store in the recording directory. After this the tool will generate an `index.ts` file with
constants that can be used to initialize a recorded backend instance.

The mock tooling is invoked through command line and takes the following arguments:

-   `recordingDir` - directory where input and outputs of recordings live
-   `projectId` - identifier of project from which to capture data
-   `username` - username to authenticate as
-   `hostname` - GoodData platform hostname (default is secure.gooddata.com)
-   `config` - optionally provide path to tool configuration (by default looks for .gdmockrc in current dir)

Config is a JSON file containing an object with pre-defined values of the command line arguments. The keys match
names of command line arguments.

If the tool does not receive mandatory argument via either CLI or from config, then it will prompt interactively.

### Recording dir conventions

The recording directory passed to the tooling is expected to follow this layout:

-   `executions` subdir: this is where execution inputs and outputs are stored

    The `executions` directory can be further organized in any way you see fit. The only hard rule is that
    each unique execution is in its own subdirectory and the execution input is stored in `definition.json` file.

    The `definition.json` file contains serialized IExecutionDefinition.

    On top of this there is a soft rule that the directory in which the `definition.json` is stored should be
    named after the fingerprint of the execution definition in the `definition.json`. This is useful convention
    to have in order to keep only unique recordings.

    The `scenarios.json` file is optional. If included in execution directory, it is expected to contain
    list of vis-scenario pairs. The tool will use this metadata to generate a `Scenarios` mapping in the
    recording `index.ts` file; this mapping can be used to conveniently access particular execution recordings
    and create data view facades out of them.

    The `requests.json` file is optional If included it specifies what data views should be obtained for
    the execution definition.

### Recordings and their JSON Schemas

NOTE: schemas are out of date at the moment; ignore them for now.

Each recording is stored in its own directory and is composed of three files:

-   execution definition; stored in definition.json
-   TODO: update this with executionResult.json
-   TODO: update this with dataView_all.json

The [schemas](schemas) directory contains recording-definition.json, recording-response.json and
recording-result.json files that describe how each of the recording inputs should look like.

Most IDEs and editors offer a way to verify files by schema and even provide autocomplete assistance when
creating or editing the files. To benefit from this (recommended) you should setup your IDE to use these schemas -
they are not published publicly and so using them typically requires setup in IDE.

#### IntelliJ

Go to `Settings... > JSON Schema Mappings`; when there, add the following mappings:

-   sdk-model.json; select sdk-model/schema/sdk-model.json file; set schema version to V7; no
    additional mappings
-   sdk-backend-spi.json; select sdk-backend-spi/schema/sdk-backend-spi.json file; set schema version to V7; no
    additional mappings
-   recording-definition.json; chose the recording-definition.json from this project; select JSON Schema V7;
    then Add Mapping (+ sign) > Add File Path pattern; enter definition.json
-   recording-response.json; analogous to definition, except select recording-response.json and file path pattern is
    response.json
-   recording-result.json; analogous to definition, except select recording-result.json and file path pattern is
    result.json

With these settings in place, IntelliJ will automatically map all mock definition, responses and results to be
validated against the respective schemas.

## License

Copyright (C) 2007-2020, GoodData(R) Corporation. All rights reserved.

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/mock-handling/LICENSE)
