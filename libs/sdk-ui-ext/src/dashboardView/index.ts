// (C) 2020-2021 GoodData Corporation
import { DashboardViewErrorBoundary, IDashboardViewErrorBoundaryState } from "./DashboardViewErrorBoundary";
export { DashboardViewErrorBoundary as DashboardView, IDashboardViewErrorBoundaryState };

export { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
export { mergeFiltersWithDashboard } from "./mergeFiltersWithDashboard";

export * from "./types";
export {
    useDashboard,
    IUseDashboardConfig,
    useDashboardAlerts,
    IUseDashboardAlertsConfig,
    useDashboardWidgetExecution,
    IUseDashboardWidgetExecutionConfig,
    useDashboardPdfExporter,
    IUseDashboardPdfExporterConfig,
    IUseDashboardPdfExporterResult,
} from "../internal/dashboardEmbedding";
