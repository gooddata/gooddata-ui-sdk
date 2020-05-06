# SDK 7 => SDK 8 migration guide

## Packages renamed:

-   @gooddata/gd-bear-client => @gooddata/gd-bear-client
-   @gooddata/typings => @gooddata/gd-bear-model
-   @gooddata/react-components => @gooddata/sdk-ui, filters, charts, pivot, ext

### Changes in react-components => sdk-ui & friends

#### Removed components

-   AfmComponents are not present in SDK 8; use the main components instead

    -   Migration steps: TBD

-   The Table component is not present in SDK 8; use the PivotTable component instead

-   BucketExecutor component is not present in SDK 8; use Execute component

-   Visualization component is not present in SDK 8; use InsightView component instead

    -   the insight to be shown can no longer be specified by its URI, use its identifier instead
    -   the props were changed (see below)
    -   detailed migration TBD

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

-   Combo Chart no longer has columnMeasures and lineMeasures

    -   use primaryMeasures and secondaryMeasures

-   Execute component public API has changed

    -   TODO: add description & migration guide

-   Model helpers replaced by factory functions and moved to sdk-model

    -   TODO: add description & migration guide

-   The exported HeaderPredicateFactory is now exported as HeaderPredicates

-   The UMD version of gd-bear-client is now exposed in the `/umd` folder (not `/dist` as in previous versions)

    -   to migrate, please update the import paths appropriately

#### Styling changes

-   Styles were also split into the respective packages (chart styles to sdk-ui-charts etc)
-   To import styles for all charts: import "@gooddata/sdk-ui-charts/styles/css/main.css"
-   To import styles for pivot: import "@gooddata/sdk-ui-pivot/styles/css/main.css"
-   To import styles for all filters: import "@gooddata/sdk-ui-filters/styles/css/main.css"
    -   It is however recommended to only import styles for the filters you actually use. Those
        are in stand-alone files: attributeFilter.scss, dateFilter.scss, measureValueFilter.scss
-   Apart from the organizational changes, there were no changes to the styles, classes etc.
