# GoodData Mock Handling Tool

The CLI tool in this project aims to automate capture and management of test data.

## Overview

Given an recording directory, mock tooling with traverse the directory, looking for definitions of data to retrieve
from live backend and store in the recording directory. This same directory can then be fed to an instance of
recorded backend, which will work on top of this recorded data.

The mock tooling is invoked through command line and takes the following arguments:

-   `recordingDir` - directory where input and outputs of recordings live
-   `projectId` - identifier of project from which to capture data
-   `username` - username to authenticate as
-   `hostname` - GoodData platform hostname (default is secure.gooddata.com)
-   `config` - optionally provide path to tool configuration

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

### Recordings and their JSON Schemas

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

### Legacy recordings

Legacy recordings come from pre-8.0 era and used to contain AFM + result spec, afm exec response and afm exec result.
We had myriad of those recordings used in various unit and component tests. The method of their creation is unknown,
mythical even (possibly through a tool long lost during a leaver-computer-wipe).

There is a legacy tooling to convert them to a slightly different format and automate generation of inputs to
legacy recorded backend. This tooling is of bad quality and should not be enhanced any further. Any effort in
this area should instead be aimed at removing use of the legacy recordings:

-   convertToRecording.ts - this program takes existing test data (for instance in sdk-ui/stories/test_data)
    and converts it to recording which contains:

    -   execution definition (IExecutionDefinition)
    -   exec response (AFM Exec Response)
    -   exec result (AFM Execution Result)

-   playlistGenerator.ts - given directory, this program looks for subdirs with recordings (see above) and
    generates a `playlist.ts` file in the given directory. This playlist contains exported constants
    with objects that have the recorded data in them

    The constants generated like this can then be fed to recordedDataFacade() which will create a DataViewFacade.

    This should eventually be enhanced so that the playlistGenerator also calculates exec definition fingerprints
    and creates a mapping between fingerprint => object with data. This can then be fed to recordedBackend() which
    can simulate all execution interaction from this.
