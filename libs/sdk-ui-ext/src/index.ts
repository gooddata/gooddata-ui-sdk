// (C) 2007-2021 GoodData Corporation
/**
 * This package contains various extensions on top of the stable components included in GoodData.UI.
 *
 * @remarks
 * The extensions land here instead of their own project as part of their staged development.
 *
 * Notable members of the package are InsightView and DashboardView, the components that allow you to embed
 * Analytical Designer insights and Dashboards/KPI Dashboards, respectively.
 *
 * @packageDocumentation
 */

export { clearInsightViewCaches, clearDashboardViewCaches } from "./dataLoaders";
export * from "./dashboardView";
export * from "./insightView";

// exported for sdk-ui-dashboard
export {
    validateDashboardLayoutWidgetSize,
    MeasurableWidgetContent,
    IDrillDownDefinition,
    isDrillDownDefinition,
} from "./internal";
