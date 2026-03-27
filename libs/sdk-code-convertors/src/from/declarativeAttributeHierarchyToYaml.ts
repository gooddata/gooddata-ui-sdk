// (C) 2024-2026 GoodData Corporation

import { Document } from "yaml";

import { type AfmObjectIdentifier, type DeclarativeAttributeHierarchy } from "@gooddata/api-client-tiger";
import { type IAttributeHierarchyMetadataObject } from "@gooddata/sdk-model";

import type { AttributeHierarchy } from "../schemas/v1/metadata.js";
import { ATTRIBUTE_HIERARCHY_COMMENT } from "../utils/texts.js";
import { entryWithSpace, fillOptionalMetaFields, getIdentifier } from "../utils/yamlUtils.js";

export type OverrideAttributeHierarchyDefinition = Omit<IAttributeHierarchyMetadataObject, "attributes"> & {
    attributes: AfmObjectIdentifier[];
};

/** @public */
export function declarativeAttributeHierarchyToYaml(hierarchy: DeclarativeAttributeHierarchy): {
    content: string;
    json: AttributeHierarchy;
} {
    const content = hierarchy.content as OverrideAttributeHierarchyDefinition;

    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type: "attribute_hierarchy",
        id: hierarchy.id,
    });

    // Add intro comment to the document
    doc.commentBefore = ATTRIBUTE_HIERARCHY_COMMENT;

    // Add optional meta fields
    fillOptionalMetaFields(doc, hierarchy);

    // Add mandatory fields
    doc.add(
        entryWithSpace(
            "attributes",
            content.attributes.map((attr) => getIdentifier(attr)),
        ),
    );

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as AttributeHierarchy,
    };
}
