// (C) 2019-2022 GoodData Corporation

import {
    AfmObjectIdentifier,
    AttributeExecutionResultHeader,
    AttributeHeaderOut,
    ExecutionResultHeader,
    ResultDimensionHeader,
    MeasureExecutionResultHeader,
    TotalExecutionResultHeader,
} from "../generated/afm-rest-api/index.js";
import {
    JsonApiFilterContextIn,
    JsonApiVisualizationObjectOutWithLinks,
    JsonApiDashboardPluginOutWithLinks,
    JsonApiDashboardPluginOutWithLinksTypeEnum,
    JsonApiFilterContextInTypeEnum,
    JsonApiVisualizationObjectOutWithLinksTypeEnum,
} from "../generated/metadata-json-api/index.js";

/**
 * @public
 */
export function isAttributeHeader(header: ResultDimensionHeader): header is AttributeHeaderOut {
    return header && (header as AttributeHeaderOut).attributeHeader !== undefined;
}

/**
 * @public
 */
export const isAfmObjectIdentifier = (value: unknown): value is AfmObjectIdentifier => {
    return !!(
        (value as Partial<AfmObjectIdentifier>)?.identifier?.id &&
        (value as Partial<AfmObjectIdentifier>)?.identifier?.type
    );
};

/**
 * @public
 */
export function isResultAttributeHeader(
    header: ExecutionResultHeader,
): header is AttributeExecutionResultHeader {
    return (header as AttributeExecutionResultHeader).attributeHeader !== undefined;
}

/**
 * @public
 */
export function isResultMeasureHeader(header: ExecutionResultHeader): header is MeasureExecutionResultHeader {
    return (header as MeasureExecutionResultHeader).measureHeader !== undefined;
}

/**
 * @public
 */
export function isResultTotalHeader(header: ExecutionResultHeader): header is TotalExecutionResultHeader {
    return (header as TotalExecutionResultHeader).totalHeader !== undefined;
}

/**
 * @public
 */
export function isVisualizationObjectsItem(
    visualizationObject: unknown,
): visualizationObject is JsonApiVisualizationObjectOutWithLinks {
    return (
        (visualizationObject as JsonApiVisualizationObjectOutWithLinks).type ===
        JsonApiVisualizationObjectOutWithLinksTypeEnum.VISUALIZATION_OBJECT
    );
}

/**
 * @public
 */
export function isFilterContextData(filterContext: unknown): filterContext is JsonApiFilterContextIn {
    return (filterContext as JsonApiFilterContextIn).type === JsonApiFilterContextInTypeEnum.FILTER_CONTEXT;
}

/**
 * @public
 */
export function isDashboardPluginsItem(
    dashboardPlugin: unknown,
): dashboardPlugin is JsonApiDashboardPluginOutWithLinks {
    return (
        (dashboardPlugin as JsonApiDashboardPluginOutWithLinks).type ===
        JsonApiDashboardPluginOutWithLinksTypeEnum.DASHBOARD_PLUGIN
    );
}
