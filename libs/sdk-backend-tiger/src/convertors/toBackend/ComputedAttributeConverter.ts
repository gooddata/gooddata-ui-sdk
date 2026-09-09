// (C) 2026 GoodData Corporation

import { type JsonApiComputedAttributeInAttributes } from "@gooddata/api-client-tiger";
import { type IComputedAttributeMetadataObjectDefinition } from "@gooddata/sdk-model";

import { definedOnly } from "../../utils/definedOnly.js";

/**
 * Optional fields are sent only when the definition sets them, so the backend keeps applying its
 * own defaults for the rest instead of receiving explicit undefined keys.
 */
export function convertComputedAttributeToBackend(
    computedAttribute: IComputedAttributeMetadataObjectDefinition,
): JsonApiComputedAttributeInAttributes {
    return {
        title: computedAttribute.title,
        description: computedAttribute.description,
        content: {
            maql: computedAttribute.expression,
            ...definedOnly({
                format: computedAttribute.format,
                metricType: computedAttribute.metricType,
            }),
        },
        ...definedOnly({
            tags: computedAttribute.tags,
            isHidden: computedAttribute.isHidden,
            dataType: computedAttribute.dataType,
            valueType: computedAttribute.valueType,
            isNullable: computedAttribute.isNullable,
            nullValue: computedAttribute.nullValue,
            locale: computedAttribute.locale,
        }),
    };
}
