# GoodData.UI SDK - applink tool

The `applink` tool is useful for live dev testing new SDK features and other SDK changes directly in the
apps that use SDK. It aims to address challenges related to linkage of a complex SDK into the target apps:

-   `npm link` or `yarn link` are cumbersome to setup when many packages are involved; they additionally expose
    the target app to problems with 3rd party dependency linkage

-   setting up `dev` mode for all the involved packages is also cumbersome - you need to know what packages to start
    dev mode in, and then have as many terminal windows

## Usage

The idea of applink is that with a simple invocation such as `npm run applink devTo /home/user/myApp` the tool will:

-   Identify what SDK packages are used in the target app
-   Start watching for source code changes in those SDK packages
-   On change, run incremental build and 'publish' the new dist directly into the target app's `node_modules`

## Current limitations

1.  Handling build errors and recovery from build errors is missing.

    The tool will at the moment not propagate any changes in case of build error - which is likely desired. As soon as
    multiple packages have their source code updated and one of them fails the build, none of the built changes will be
    propagated either.

    This is questionable and needs further thought - especially once the tool's limitation #1 is addressed.

2.  Styles are not yet handled

## Technical Notes

The tool has its own file change watch logic (using chokidar) and does not rely on TypeScript 'watch' mode - this is
mostly to have better control and messaging. The tool will watch source files of the packages that the target app
depends on, link the source file changes to the respective packages and run incremental builds for them.

The tool uses `rsync` to copy changed files.

## License

(C) 2020 GoodData Corporation

This project is under MIT License. See [LICENSE](LICENSE).
