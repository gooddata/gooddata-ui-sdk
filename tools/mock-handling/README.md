This project contains tooling related to handling mock data / test data. This is developer tooling.

The tooling is of assorted quality - the standards are pretty low :) Not all tools in here necessarily provide
a fancy command line interface (with options, colors and with emojis). Often times they are merely programs
to launch directly from IDE. If that bothers you, then please go ahead and enhance, wrap them with CLI.

The available programs so far:

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
