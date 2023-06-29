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
} from "./internal/index.js";

export { clearInsightViewCaches } from "./dataLoaders/index.js";
export * from "./insightView/index.js";

// exported for sdk-ui-dashboard
export {
    IDrillDownDefinition,
    isDrillDownDefinition,
    IVisualizationSizeInfo,
    IVisualizationDefaultSizeInfo,
    IVisualizationMeta,
    ISizeInfo,
    ISizeInfoDefault,
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
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    WIDGET_DROPZONE_SIZE_INFO_DEFAULT,
    EmbedInsightDialog,
    IEmbedInsightDialogProps,
} from "./internal/index.js";

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
    backendSupportsElementUris: boolean,
): IInsight {
    return FullVisualizationCatalog.forInsight(insight).applyDrillDown(
        insight,
        {
            drillDefinition,
            event: drillEvent,
        },
        backendSupportsElementUris,
    );
}

/**
 * @internal
 */
export function getInsightVisualizationMeta(insight: IInsightDefinition): IVisualizationMeta {
    return FullVisualizationCatalog.forInsight(insight).getMeta();
}
