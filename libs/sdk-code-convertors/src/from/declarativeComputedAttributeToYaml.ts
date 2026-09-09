// (C) 2026 GoodData Corporation

import { Document } from "yaml";

import { type DeclarativeComputedAttribute } from "@gooddata/api-client-tiger";
import type { ComputedAttribute } from "@gooddata/sdk-code-schemas/v1";

import { COMPUTED_ATTRIBUTE_COMMENT } from "../utils/texts.js";
import { entryWithSpace, fillOptionalMetaFields } from "../utils/yamlUtils.js";

/** @public */
export function declarativeComputedAttributeToYaml(computedAttribute: DeclarativeComputedAttribute): {
    content: string;
    json: ComputedAttribute;
} {
    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type: "computed_attribute",
        id: computedAttribute.id,
    });

    // Add intro comment to the document
    doc.commentBefore = COMPUTED_ATTRIBUTE_COMMENT;

    // Add optional meta fields
    fillOptionalMetaFields(doc, computedAttribute);

    // Add MAQL field
    doc.add(entryWithSpace("maql", computedAttribute.content.maql ?? ""));

    // Add formatting of the computed values
    if (computedAttribute.content.format) {
        doc.add(doc.createPair("format", computedAttribute.content.format));
    }
    if (computedAttribute.content.metricType) {
        doc.add(doc.createPair("metric_type", computedAttribute.content.metricType));
    }

    // Add typing of the computed values
    if (computedAttribute.dataType) {
        doc.add(doc.createPair("data_type", computedAttribute.dataType));
    }
    if (computedAttribute.valueType) {
        doc.add(doc.createPair("value_type", computedAttribute.valueType));
    }
    if (computedAttribute.isNullable !== undefined) {
        doc.add(doc.createPair("is_nullable", computedAttribute.isNullable));
    }
    if (computedAttribute.nullValue !== undefined) {
        doc.add(doc.createPair("null_value_join_replacement", computedAttribute.nullValue));
    }

    // Add visibility flag only when hidden
    if (computedAttribute.isHidden === true) {
        doc.add(doc.createPair("show_in_ai_results", false));
    }

    if (computedAttribute.locale) {
        doc.add(doc.createPair("locale", computedAttribute.locale));
    }

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as ComputedAttribute,
    };
}
