# SDK 7 => SDK 8 migration guide

## Packages renamed:

-   @gooddata/gd-bear-client => @gooddata/gd-bear-client
-   @gooddata/typings => @gooddata/gd-bear-model
-   @gooddata/react-components => @gooddata/sdk-ui

### Changes in react-components => sdk-ui

#### Removed components

-   AfmComponents are not present in SDK 8; use the main components instead

    -   Migration steps: TBD

-   The Table component is not present in SDK 8; use the PivotTable component instead

-   BucketExecutor component is not present in SDK 8; use Execute component

#### Public API changes

-   Charts no longer have the sdk prop

    -   prop renamed to backend
    -   prop type changed to IAnalyticalBackend

-   Charts no longer have projectId prop

    -   prop renamed to workspace

-   Charts no longer have environment prop

    -   prop deleted, it was a red herring, not used for anything

-   Charts no longer have onLoadingFinish prop

    -   prop deleted, it was red herring, never fired for charts

-   Charts no longer have onFiredDrillEvent prop

    -   prop renamed to onDrill

-   IPushData no longer contains result prop
    -   it contains dataView prop instead
