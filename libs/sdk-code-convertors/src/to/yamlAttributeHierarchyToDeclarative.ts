// (C) 2023-2026 GoodData Corporation

import { type DeclarativeAttributeHierarchy } from "@gooddata/api-client-tiger";

import type { AttributeHierarchy } from "../schemas/v1/metadata.js";
import { convertIdToTitle } from "../utils/sharedUtils.js";
import { createIdentifier } from "../utils/yamlUtils.js";

/** @public */
export function yamlAttributeHierarchyToDeclarative(
    input: AttributeHierarchy,
): DeclarativeAttributeHierarchy {
    return {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        tags: input.tags ?? [],
        description: input.description ?? "",
        content: {
            attributes: input.attributes.map((attr) => createIdentifier(attr)).filter(Boolean),
        },
    };
}
