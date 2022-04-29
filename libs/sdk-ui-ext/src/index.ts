// (C) 2007-2022 GoodData Corporation
/**
 * This package contains various extensions on top of the stable components included in GoodData.UI.
 *
 * @remarks
 * The extensions land here instead of their own project as part of their staged development.
 *
 * Notable member of the package is InsightView, the component that allows you to embed
 * Analytical Designer insights.
 *
 * @packageDocumentation
 */

import { IInsight, IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import { IDrillEvent } from "@gooddata/sdk-ui";
import {
    fluidLayoutDescriptor,
    FullVisualizationCatalog,
    IDrillDownDefinition,
    IVisualizationSizeInfo,
    IVisualizationMeta,
} from "./internal";

export { clearInsightViewCaches } from "./dataLoaders";
export * from "./insightView";

// exported for sdk-ui-dashboard
export {
    IDrillDownDefinition,
    isDrillDownDefinition,
    IVisualizationSizeInfo,
    IVisualizationMeta,
    ISizeInfo,
    fluidLayoutDescriptor,
    FluidLayoutDescriptor,
    IFluidLayoutDescriptor,
    ILayoutDescriptor,
    LayoutType,
    isEmptyAfm,
    EmptyAfmSdkError,
    PluggableVisualizationErrorCodes,
    PluggableVisualizationErrorType,
    addIntersectionFiltersToInsight,
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    EmbedInsightDialog,
    IEmbedInsightDialogProps,
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
    drillEvent: IDrillEvent,
    drillDefinition: IDrillDownDefinition,
): IInsight {
    return FullVisualizationCatalog.forInsight(insight).applyDrillDown(insight, {
        drillDefinition,
        event: drillEvent,
    });
}

/**
 * @internal
 */
export function getInsightVisualizationMeta(insight: IInsightDefinition): IVisualizationMeta {
    return FullVisualizationCatalog.forInsight(insight).getMeta();
}

/**
 * @internal
 */
export function isGeneratingInsightCodeSupported(insight: IInsightDefinition): boolean {
    return !!FullVisualizationCatalog.forInsight(insight).getEmbeddingCode;
}
