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
    doc.add(entryWithSpace("maql", (computedAttribute.content as any).maql ?? ""));

    // dataType and valueType are deliberately not written out - they are backend defaults the YAML
    // shape does not expose (see yamlComputedAttributeToDeclarative)
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
