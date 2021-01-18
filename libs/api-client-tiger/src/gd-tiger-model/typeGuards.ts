// (C) 2019-2021 GoodData Corporation

import {
    AttributeExecutionResultHeader,
    AttributeHeader,
    ExecutionResultHeader,
    ObjectIdentifier,
    ResultDimension,
} from "../generated/afm-rest-api";
import { JsonApiFilterContext, JsonApiVisualizationObject } from "../generated/metadata-json-api";

export type ResultDimensionHeader = ResultDimension["headers"][number];

export function isAttributeHeader(header: ResultDimensionHeader): header is AttributeHeader {
    return header && (header as AttributeHeader).attributeHeader !== undefined;
}

export const isObjectIdentifier = (value: unknown): value is ObjectIdentifier => {
    return !!(
        (value as Partial<ObjectIdentifier>)?.identifier?.id &&
        (value as Partial<ObjectIdentifier>)?.identifier?.type
    );
};

export function isResultAttributeHeader(
    header: ExecutionResultHeader,
): header is AttributeExecutionResultHeader {
    return (header as AttributeExecutionResultHeader).attributeHeader !== undefined;
}

export function isVisualizationObjectsItem(
    visualizationObject: unknown,
): visualizationObject is JsonApiVisualizationObject {
    return (visualizationObject as JsonApiVisualizationObject).type === "visualizationObject";
}

export function isFilterContextData(filterContext: unknown): filterContext is JsonApiFilterContext {
    return (filterContext as JsonApiFilterContext).type === "filterContext";
}
