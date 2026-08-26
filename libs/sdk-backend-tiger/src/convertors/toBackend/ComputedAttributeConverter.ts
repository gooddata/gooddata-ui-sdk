// (C) 2026 GoodData Corporation

import { type JsonApiComputedAttributeInAttributes } from "@gooddata/api-client-tiger";
import { type IComputedAttributeMetadataObjectDefinition } from "@gooddata/sdk-model";

export function convertComputedAttributeToBackend(
    computedAttribute: IComputedAttributeMetadataObjectDefinition,
): JsonApiComputedAttributeInAttributes {
    return {
        title: computedAttribute.title,
        description: computedAttribute.description,
        content: {
            maql: computedAttribute.expression,
            format: computedAttribute.format,
            ...(typeof computedAttribute.metricType === "undefined"
                ? {}
                : { metricType: computedAttribute.metricType }),
        },
        tags: computedAttribute.tags,
        isHidden: computedAttribute.isHidden,
        dataType: computedAttribute.dataType,
        isNullable: computedAttribute.isNullable,
        nullValue: computedAttribute.nullValue,
        locale: computedAttribute.locale,
    };
}
