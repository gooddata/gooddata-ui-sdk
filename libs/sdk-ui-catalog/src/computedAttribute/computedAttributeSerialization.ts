// (C) 2026 GoodData Corporation

import { Document } from "yaml";

import type { ComputedAttributeYaml } from "./computedAttributeConverter.js";

/**
 * Serializes a canonical AAC computed attribute object to YAML.
 *
 * The document is a flat, gap-free list of lines in the order the design prescribes: `id`, `type`,
 * `title`, `description`, then `maql` last, so the expression the author came to write sits at the
 * bottom with the room below it. The `id` line is always rendered, empty when the computed attribute
 * has none, so an author who wants to choose the identity has the key waiting; left blank it is
 * dropped on validation and the server derives one on create.
 *
 * `description` is always rendered, empty as `""`, so the field an author is likely to fill is
 * offered rather than hidden. An empty `maql` renders as `maql: ` (a trailing space after the
 * colon) so the next character the author types is a YAML scalar, not `maql:SELECT` which is
 * a syntax error; an empty `id` renders the same way for the same reason.
 */
export function serializeComputedAttributeToYaml(computedAttribute: ComputedAttributeYaml): string {
    const doc = new Document({ id: computedAttribute.id ?? null, type: "computed_attribute" });

    doc.add(doc.createPair("title", computedAttribute.title ?? ""));
    doc.add(doc.createPair("description", computedAttribute.description ?? ""));
    if (computedAttribute.tags && computedAttribute.tags.length > 0) {
        doc.add(doc.createPair("tags", computedAttribute.tags));
    }
    if (computedAttribute.locale) {
        doc.add(doc.createPair("locale", computedAttribute.locale));
    }
    doc.add(doc.createPair("maql", computedAttribute.maql ? computedAttribute.maql : null));

    // An unset field is a null pair (`nullStr: ""` → `maql:`). Keep one space after the colon so the
    // next character typed is a YAML scalar (`maql: SELECT …`), not `maql:SELECT` which is a syntax
    // error. Do not `trimEnd` — that would strip the space.
    const yaml = doc.toString({ lineWidth: 0, nullStr: "" }).replace(/\n+$/, "");
    return withBlankLineSpace(withBlankLineSpace(yaml, "id"), "maql");
}

/** Restores the space `nullStr: ""` leaves out after a blank key's colon, wherever the line sits. */
function withBlankLineSpace(yaml: string, key: string): string {
    return yaml.replace(new RegExp(`^${key}:$`, "m"), `${key}: `);
}
