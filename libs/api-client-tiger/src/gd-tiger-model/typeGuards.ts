// (C) 2019-2025 GoodData Corporation

import {
    AfmLocalIdentifier,
    AfmObjectIdentifier,
    AttributeExecutionResultHeader,
    AttributeHeader,
    ExecutionResultHeader,
    MeasureExecutionResultHeader,
    ResultDimensionHeader,
    TotalExecutionResultHeader,
} from "../generated/afm-rest-api/index.js";
import {
    JsonApiAttributeOutWithLinks,
    JsonApiDashboardPluginOutWithLinks,
    JsonApiDatasetOutWithLinks,
    JsonApiFactOutWithLinks,
    JsonApiFilterContextIn,
    JsonApiLabelOutWithLinks,
    JsonApiMetricOutWithLinks,
    JsonApiVisualizationObjectOutWithLinks,
} from "../generated/metadata-json-api/index.js";

/**
 * @public
 */
export function isAttributeHeader(header: ResultDimensionHeader): header is AttributeHeader {
    return header && (header as AttributeHeader).attributeHeader !== undefined;
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
export const isAfmObjectLocalIdentifier = (value: unknown): value is AfmLocalIdentifier => {
    return !!(value as Partial<AfmLocalIdentifier>)?.localIdentifier;
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
    return (visualizationObject as JsonApiVisualizationObjectOutWithLinks).type === "visualizationObject";
}

/**
 * @public
 */
export function isFilterContextData(filterContext: unknown): filterContext is JsonApiFilterContextIn {
    return (filterContext as JsonApiFilterContextIn).type === "filterContext";
}

/**
 * @public
 */
export function isDashboardPluginsItem(
    dashboardPlugin: unknown,
): dashboardPlugin is JsonApiDashboardPluginOutWithLinks {
    return (dashboardPlugin as JsonApiDashboardPluginOutWithLinks).type === "dashboardPlugin";
}

/**
 * @public
 */
export function isDataSetItem(dataSet: unknown): dataSet is JsonApiDatasetOutWithLinks {
    return (dataSet as JsonApiDatasetOutWithLinks).type === "dataset";
}

/**
 * @public
 */
export function isLabelItem(label: unknown): label is JsonApiLabelOutWithLinks {
    return (label as JsonApiLabelOutWithLinks).type === "label";
}

/**
 * @public
 */
export function isAttributeItem(attribute: unknown): attribute is JsonApiAttributeOutWithLinks {
    return (attribute as JsonApiAttributeOutWithLinks).type === "attribute";
}

/**
 * @public
 */
export function isFactItem(fact: unknown): fact is JsonApiFactOutWithLinks {
    return (fact as JsonApiFactOutWithLinks).type === "fact";
}

/**
 * @public
 */
export function isMetricItem(metric: unknown): metric is JsonApiMetricOutWithLinks {
    return (metric as JsonApiMetricOutWithLinks).type === "metric";
}
