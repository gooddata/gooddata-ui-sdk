// (C) 2026 GoodData Corporation

import type { IComputedAttributeMetadataObjectDefinition } from "@gooddata/sdk-model";

import { deriveCopyIdentity } from "../asCode/copy.js";

export function createCopiedComputedAttribute(
    computedAttribute: IComputedAttributeMetadataObjectDefinition,
): IComputedAttributeMetadataObjectDefinition {
    // Whitelist only definition-owned fields; the source may be a loaded computed attribute carrying
    // server-managed fields (uri, ref, timestamps, ...) that must not leak into the definition.
    // The value-shaping fields are author-owned semantics, so they carry over.
    return {
        type: "computedAttribute",
        ...deriveCopyIdentity(computedAttribute),
        description: computedAttribute.description,
        tags: computedAttribute.tags,
        expression: computedAttribute.expression,
        ...(computedAttribute.format === undefined ? {} : { format: computedAttribute.format }),
        ...(computedAttribute.metricType === undefined ? {} : { metricType: computedAttribute.metricType }),
        ...(computedAttribute.dataType === undefined ? {} : { dataType: computedAttribute.dataType }),
        ...(computedAttribute.isNullable === undefined ? {} : { isNullable: computedAttribute.isNullable }),
        ...(computedAttribute.nullValue === undefined ? {} : { nullValue: computedAttribute.nullValue }),
        ...(computedAttribute.locale === undefined ? {} : { locale: computedAttribute.locale }),
    };
}
