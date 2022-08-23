# GoodData.UI SDK - applink tool

The `applink` tool is useful for live dev testing new SDK features and other SDK changes directly in the
apps that use SDK. It aims to address challenges related to linkage of a complex SDK into the target apps:

-   `npm link` or `yarn link` are cumbersome to setup when many packages are involved; they additionally expose
    the target app to problems with 3rd party dependency linkage

-   setting up `dev` mode for all the involved packages is also cumbersome - you need to know what packages to start
    dev mode in, and then have as many terminal windows

## Usage

Start `npm run applink devConsole /home/user/myApp`.

This will bring up an application with terminal UI which will automatically:

-   Determine what packages from this repo are used in your app
-   Monitor source folders of those packages for changes
-   Upon changes, trigger incremental builds of the changed packages and all packages which depend on them
-   Upon build artifact changes, trigger rsync of the build between the source and the target app

The `devConsole` user interface indicates consists for three sections:

-   Package List on the left displays all SDK packages used by the target app

    -   Next to each package are build state (first) and publish state indicators (second)
        -   Both indicators start blue
        -   If package sources changed and its build is scheduled, the build indicator is yellow
        -   If package build is queued, the indicator contains letter 'Q'
        -   If package build is running, the indicator contains character '\*'
        -   If build succeeded, the build indicator is green. The publish indicator turns yellow to indicate the target
            is out of date
        -   If build failed, the build indicator is red
        -   Once successful build is copied to the target app, the publish indicator turns green
    -   You can navigate the list using arrow keys and 'Home' or 'End' keys
        -   As you select a package, its dependencies will also be highlighted

-   Build output on the right displays the stdout of the incremental build

    -   Select a package and press 'Enter' to show the available output
    -   This will move focus to the build output, allowing you to scroll long outputs
    -   If you press 'Enter' again, the focus returns to the package list

    > Note: focused build output will be automatically refreshed as builds happen

-   Application log at the bottom is updated with essential messages about the application operations

The application supports several global hotkeys:

-   'F2' toggles expanded / minimized application log
-   'F7' triggers ad-hoc build of currently selected package, ignoring builds of any of its dependencies
-   'F8' triggers ad-hoc build of currently selected package and all its dependencies

> Note: The hotkeys work even if you are browsing build output.

### autoBuild

Start `npm run applink autoBuild`.

The autoBuild mode is a special mode of the devConsole suitable for automation of incremental SDK library builds. In
this mode the dev console will not work towards updating some target application with latest build artifacts.

Instead, it looks at all libs and tools, monitors changes and automatically triggers incremental builds in the
affected packages. The build artifacts will be created in the respective packages output directories, but will not
be propagated anywhere.

This mode is useful especially in conjuction with the [examples/playground] project. You can start the playground in
dev mode, start the applink dev console in autoBuild mode and every time you make a change to SDK package applink
will trigger the build, this will populate the build outputs and the playground's watcher will pick it up, rebuild
and reload the browser.

## Current limitations

1.  Styles are not yet handled
2.  Terminal UI does not respond to resizing

## Technical Notes

The tool has its own file change watch logic (using chokidar) and does not rely on TypeScript 'watch' mode - this is
mostly to have better control and messaging. The tool will watch source files of the packages that the target app
depends on, link the source file changes to the respective packages and run incremental builds for them.

The tool uses `rsync` to copy changed files.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/applink/LICENSE).
