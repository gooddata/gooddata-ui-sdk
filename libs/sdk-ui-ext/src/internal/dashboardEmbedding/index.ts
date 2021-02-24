// (C) 2020-2021 GoodData Corporation

/**
 * Soon to be publicly exported stuff
 */

// Hooks and data loading
export * from "./hooks";
export { clearDashboardViewCaches } from "./hooks/dataLoaders"; // TODO RAIL-2956 merge with other data loaders once moving to non internal

// DashboardView itself
export { DashboardView, IDashboardViewProps, defaultThemeModifier } from "./DashboardView";

// Publicly documented utilities
export { isDateFilterIrrelevant, mergeFiltersWithDashboard } from "./utils/filters";

// Publicly documented types
export { IDashboardFilter } from "./types";

//
//
//

/**
 * Stuff exported only for internal use (should probably stay in the /internal folder if possible)
 */

export {
    DASHBOARD_TITLE_MAX_LENGTH,
    PLATFORM_DATE_FORMAT,
    IScheduledMailDialogRendererOwnProps,
    ScheduledMailDialogRenderer,
} from "./ScheduledMail";
export * from "./DashboardItem";
export * from "./KpiAlerts";
export * from "./KpiContent";
export { IKpiAlertResult, IKpiResult, KpiAlertOperationStatus } from "./types";

// TODO: RAIL-2869 Migrate to Responsive context
export {
    DASHBOARD_LAYOUT_BREAKPOINT_LG,
    DASHBOARD_LAYOUT_BREAKPOINT_MD,
    DASHBOARD_LAYOUT_BREAKPOINT_SM,
    DASHBOARD_LAYOUT_BREAKPOINT_XS,
    DASHBOARD_LAYOUT_BREAK_POINTS,
    DASHBOARD_LAYOUT_CONTAINER_WIDTHS,
    DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT,
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    DASHBOARD_LAYOUT_GRID_CONFIGURATION,
    DASHBOARD_LAYOUT_GUTTER_WIDTH,
    DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS,
    DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH,
    DASHBOARD_LAYOUT_WIDGET_CLASS,
    SCREEN_BREAKPOINT_LG,
    SCREEN_BREAKPOINT_MD,
    SCREEN_BREAKPOINT_SM,
    SCREEN_BREAKPOINT_XL,
    SCREEN_BREAKPOINT_XS,
    SCREEN_BREAKPOINT_XXL,
    WIDGET_DIMENSIONS_DEFAULT,
    WIDGET_DIMENSIONS_TABLE,
    DashboardLayout,
    DashboardLayoutColumnRenderer,
    DashboardLayoutContentRenderer,
    DashboardLayoutRowRenderer,
    DashboardViewLayoutWidgetClass,
    DashboardViewWidgetDimensionsByWidgetClass,
    IDashboardViewLayout,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutColumnKeyGetter,
    IDashboardViewLayoutColumnRenderProps,
    IDashboardViewLayoutColumnRenderer,
    IDashboardViewLayoutContent,
    IDashboardViewLayoutContentRenderer,
    IDashboardViewLayoutProps,
    IDashboardViewLayoutRow,
    IDashboardViewLayoutRowKeyGetter,
    IDashboardViewLayoutRowRenderer,
    IDashboardViewWidgetDimension,
    calculateGeoPushpinWidgetHeight,
    getDashboardLayoutContentHeightForRatioAndScreen,
    getDashboardLayoutMinimumWidgetHeight,
    getGeoPushpinWidgetStyle,
    getResponsiveClassName,
    isDashboardViewLayoutWidgetClass,
    isFullWidthGeoPushpin,
    isGeoPushpin,
    unifyDashboardLayoutColumnHeights,
    DashboardLayoutRowHeader,
    IDashboardViewLayoutCommonRenderProps,
    IDashboardViewLayoutContentRenderProps,
    IDashboardViewLayoutRenderer,
    IDashboardViewLayoutRowHeaderRenderProps,
    IDashboardViewLayoutRowHeaderRenderer,
    IDashboardViewLayoutRowRenderProps,
    DashboardLayoutRowHeaderRenderer,
} from "./DashboardLayout";
export {
    ALL_SCREENS,
    FluidLayout,
    FluidLayoutColumn,
    FluidLayoutColumnRenderer,
    FluidLayoutRow,
    FluidLayoutRowRenderer,
    IFluidLayoutColumnKeyGetter,
    IFluidLayoutColumnRenderProps,
    IFluidLayoutColumnRenderer,
    IFluidLayoutContentRenderer,
    IFluidLayoutRowKeyGetter,
    IFluidLayoutRowRenderProps,
    IFluidLayoutRowRenderer,
    IFluidLayoutColumnProps,
    IFluidLayoutProps,
    IFluidLayoutRowProps,
    IFluidLayoutColumnKeyGetterProps,
    IFluidLayoutContentRenderProps,
    IFluidLayoutRenderer,
    IFluidLayoutRowHeaderRenderProps,
    IFluidLayoutRowHeaderRenderer,
    IFluidLayoutRowKeyGetterProps,
} from "./FluidLayout";
