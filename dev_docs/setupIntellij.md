# How to setup IntelliJ when working on SDK

The monorepo setup is quite challenging for IntelliJ IDEs. The size of the monorepo combined with
Rush symlinking can lead to very poor performance and excessively long indexing times.

Here are couple of hints to achieve optimal setup:

-   Increase max heap to at least 4GB

    -   Go to `Help > Edit Custom VM Options`
    -   Add/replace -Xmx setting to at least `-Xmx4096m`

-   Mark the following directories as `Excluded` - this may be time-consuming:

    -   `common/temp`
    -   All `dist` directories in all packages (in both `libs` and `tools`)
    -   All `esm` directories in all packages (in `libs`)
    -   If IntelliJ does not automatically exclude `node_modules`, then mark them as excludes as well

## Refactoring

Automated code refactorings such as 'Rename file' can take _a long_ time when touching files with common
names as `index.ts` or `util.ts`. The IDE could get stuck for _minutes_ or crash while running out of heap space.
The best approach is to setup scopes:

-   Open `Settings`
-   Find `Scopes`
-   Create a new scope say `libs and tools` with the following value:

    `file[gooddata-ui-sdk]:libs//*||file[gooddata-ui-sdk]:tools//*`
