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

> Note: by default, the tool will fail when connecting to non-production deployment of GoodData platform where
> the X.509 certificates are not setup correctly (self-signed, internal authority): node.js will reject the
> connection due to invalid certificates. You can use the `--accept-untrusted-ssl` option to disable this
> check (under the covers this sets the node.js documented ENV var `NODE_TLS_REJECT_UNAUTHORIZED` to `0`)

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

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/mock-handling/LICENSE).
