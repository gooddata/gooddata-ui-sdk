// (C) 2026 GoodData Corporation

import { Document } from "yaml";

import type { ComputedAttributeYaml } from "./computedAttributeConverter.js";

/**
 * Serializes a canonical AAC computed attribute object to YAML.
 *
 * The document is a flat, gap-free list of lines in the order the design prescribes: `id`, `type`,
 * `title`, `description`, then `maql` last, so the expression the author came to write sits at the
 * bottom with the room below it. The `id` line is omitted when the computed attribute has none so
 * the server derives one on create.
 *
 * `description` is always rendered, empty as `""`, so the field an author is likely to fill is
 * offered rather than hidden. An empty `maql` renders as a bare `maql:` (see `nullStr`), an
 * invitation to type rather than a quoted blank to delete.
 */
export function serializeComputedAttributeToYaml(computedAttribute: ComputedAttributeYaml): string {
    const doc = new Document(
        computedAttribute.id === undefined
            ? { type: "computed_attribute" }
            : { id: computedAttribute.id, type: "computed_attribute" },
    );

    doc.add(doc.createPair("title", computedAttribute.title ?? ""));
    doc.add(doc.createPair("description", computedAttribute.description ?? ""));
    if (computedAttribute.tags && computedAttribute.tags.length > 0) {
        doc.add(doc.createPair("tags", computedAttribute.tags));
    }
    if (computedAttribute.locale) {
        doc.add(doc.createPair("locale", computedAttribute.locale));
    }
    doc.add(doc.createPair("maql", computedAttribute.maql ? computedAttribute.maql : null));

    return doc.toString({ lineWidth: 0, nullStr: "" }).trimEnd();
}
