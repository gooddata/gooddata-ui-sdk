// (C) 2020-2021 GoodData Corporation

/**
 * Soon to be publicly exported stuff
 */

// Hooks and data loading
export * from "./hooks";
export { clearDashboardViewCaches } from "./hooks/dataLoaders"; // TODO RAIL-2956 merge with other data loaders once moving to non internal

// DashboardView itself
export {
    DashboardView,
    IDashboardViewProps,
    defaultThemeModifier,
    DashboardLayoutTransform,
} from "./DashboardView";

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
    DashboardItemWithKpiAlert,
    IDashboardItemWithKpiAlertProps,
    IBrokenAlertFilterBasicInfo,
    IBrokenAlertFilter,
    IKpiAlertDialogProps,
    KpiAlertDialog,
    enrichBrokenAlertsInfo,
    getBrokenAlertFiltersBasicInfo,
    IAttributeFilterMetaCollection,
} from "./KpiAlerts";

export { IKpiAlertResult, IKpiResult } from "./types";

export { KpiContent } from "./KpiContent";

export {
    DashboardItemHeadline,
    DashboardItemContent,
    DashboardItemVisualization,
    DashboardItemHeadlineContainer,
} from "./DashboardItem";

export {
    DASHBOARD_TITLE_MAX_LENGTH,
    PLATFORM_DATE_FORMAT,
    IScheduledMailDialogRendererOwnProps,
    ScheduledMailDialogRenderer,
} from "./ScheduledMail";

export * from "./DashboardLayout";
