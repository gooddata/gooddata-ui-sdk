# Migration guide

The package `@gooddata/typings` was renamed to `@gooddata/gd-bear-model`.

## Removed types

-   `AFM` type is not longer part of `@gooddata/gd-bear-model`. Use `ExecuteAFM` type instead.
-   `VisualizationInput` type is no longer part of `@gooddata/gd-bear-model`. Use types from `@gooddata/sdk-model` package instead.
-   `Localization` type is no longer part of `@gooddata/gd-bear-model`. Use `ILocale` from `@gooddata/sdk-ui` instead.

## Public API changes

-   Type `ExecuteAFM` renamed to `GdcExecuteAFM`

-   Type `Execution` renamed to `GdcExecution`

-   Type `ExtendedDateFilters` renamed to `GdcExtendedDateFilters`

-   Type `VisualizationObject` renamed to `GdcVisualizationObject`

    -   Exported type `IVisualizationAttribute` renamed to `IAttribute`
    -   Exported type `VisualizationObjectExtendedFilter` renamed to `ExtendedFilter`
    -   Exported type `VisualizationObjectFilter` renamed to `Filter`
    -   Exported type `VisualizationObjectDateFilter` renamed to `DateFilter`
    -   Exported type `VisualizationObjectAttributeFilter` renamed to `AttributeFilter`
    -   Exported type `IVisualizationObjectRelativeDateFilter` renamed to `IRelativeDateFilter`
    -   Exported type `IVisualizationObjectAbsoluteDateFilter` renamed to `IAbsoluteDateFilter`
    -   Exported type `IVisualizationObjectPositiveAttributeFilter` renamed to `IPositiveAttributeFilter`
    -   Exported type `IVisualizationObjectNegativeAttributeFilter` renamed to `INegativeAttributeFilter`
    -   Exported type `IVisualizationTotal` renamed to `ITotal`
    -   Exported type guard function `isVisualizationAttribute` renamed to `isAttribute`

-   Type `VisualizationClass` renamed to `GdcVisualizationClass`

-   Type `DashboardExport` renamed to `GdcFilterContext`

-   Types exported from `DashboardLayout` are now located under `GdcDashboardLayout` namespace

    -   Affected types:
        -   `Layout`
        -   `Widget`
        -   `LayoutContent`
        -   `IPersistedWidget`
        -   `IFluidLayout`
        -   `IFluidLayoutRow`
        -   `IFluidLayoutColumn`
        -   `IFluidLayoutColSize`
        -   `IFluidLayoutSize`
        -   `SectionHeader`
        -   `ISectionHeader`
        -   `ISectionDescription`
