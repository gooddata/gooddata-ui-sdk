// (C) 2019-2022 GoodData Corporation

import {
    AfmObjectIdentifier,
    AttributeExecutionResultHeader,
    AttributeHeader,
    ExecutionResultHeader,
    ResultDimension,
} from "../generated/afm-rest-api";
import {
    JsonApiFilterContextIn,
    JsonApiVisualizationObjectOutWithLinks,
    JsonApiDashboardPluginOutWithLinks,
    JsonApiDashboardPluginOutWithLinksTypeEnum,
    JsonApiFilterContextInTypeEnum,
    JsonApiVisualizationObjectOutWithLinksTypeEnum,
} from "../generated/metadata-json-api";

export type ResultDimensionHeader = ResultDimension["headers"][number];

export function isAttributeHeader(header: ResultDimensionHeader): header is AttributeHeader {
    return header && (header as AttributeHeader).attributeHeader !== undefined;
}

export const isAfmObjectIdentifier = (value: unknown): value is AfmObjectIdentifier => {
    return !!(
        (value as Partial<AfmObjectIdentifier>)?.identifier?.id &&
        (value as Partial<AfmObjectIdentifier>)?.identifier?.type
    );
};

export function isResultAttributeHeader(
    header: ExecutionResultHeader,
): header is AttributeExecutionResultHeader {
    return (header as AttributeExecutionResultHeader).attributeHeader !== undefined;
}

export function isVisualizationObjectsItem(
    visualizationObject: unknown,
): visualizationObject is JsonApiVisualizationObjectOutWithLinks {
    return (
        (visualizationObject as JsonApiVisualizationObjectOutWithLinks).type ===
        JsonApiVisualizationObjectOutWithLinksTypeEnum.VISUALIZATION_OBJECT
    );
}

export function isFilterContextData(filterContext: unknown): filterContext is JsonApiFilterContextIn {
    return (filterContext as JsonApiFilterContextIn).type === JsonApiFilterContextInTypeEnum.FILTER_CONTEXT;
}

export function isDashboardPluginsItem(
    dashboardPlugin: unknown,
): dashboardPlugin is JsonApiDashboardPluginOutWithLinks {
    return (
        (dashboardPlugin as JsonApiDashboardPluginOutWithLinks).type ===
        JsonApiDashboardPluginOutWithLinksTypeEnum.DASHBOARD_PLUGIN
    );
}
