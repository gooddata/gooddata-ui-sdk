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

import { ISettings } from "@gooddata/sdk-backend-spi";
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import {
    fluidLayoutDescriptor,
    FullVisualizationCatalog,
    IDashboardDrillEvent,
    IDrillDownDefinition,
    IVisualizationSizeInfo,
} from "./internal";

export { clearInsightViewCaches, clearDashboardViewCaches } from "./dataLoaders";
export * from "./dashboardView";
export * from "./insightView";

// exported for sdk-ui-dashboard
export {
    validateDashboardLayoutWidgetSize,
    MeasurableWidgetContent,
    IDrillDownDefinition,
    isDrillDownDefinition,
    IVisualizationSizeInfo,
    ISizeInfo,
    fluidLayoutDescriptor,
    FluidLayoutDescriptor,
    IFluidLayoutDescriptor,
    ILayoutDescriptor,
    LayoutType,
} from "./internal";

// below functions are exported only for sdk-ui-dashboard use to avoid exporting the whole FullVisualizationCatalog
/**
 * @internal
 */
export function getInsightSizeInfo(insight: IInsightDefinition, settings: ISettings): IVisualizationSizeInfo {
    return FullVisualizationCatalog.forInsight(insight).getSizeInfo(insight, fluidLayoutDescriptor, settings);
}

/**
 * @internal
 */
export function getInsightWithAppliedDrillDown(
    insight: IInsight,
    drillEvent: IDashboardDrillEvent,
    drillDefinition: IDrillDownDefinition,
): IInsight {
    return FullVisualizationCatalog.forInsight(insight).applyDrillDown(insight, {
        drillDefinition,
        event: drillEvent,
    });
}
