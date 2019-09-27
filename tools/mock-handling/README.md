This project contains tooling related to handling mock data / test data. This is developer tooling.

The tooling is of assorted quality - the standards are pretty low :) Not all tools in here necessarily provide
a fancy command line interface (with options, colors and with emojis). Often times they are merely programs
to launch directly from IDE. If that bothers you, then please go ahead and enhance, wrap them with CLI.

### Available programs so far

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

### Recordings and their JSON Schemas

Each recording is stored in its own directory and is composed of three files:

-   execution definition; stored in definition.json
-   execution response (AFM execution); stored in response.json
-   execution result (AFM result); stored in result.json

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
