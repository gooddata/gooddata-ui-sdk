// (C) 2026 GoodData Corporation

import type { v1 } from "@gooddata/sdk-code-schemas";
import type { IComputedAttributeMetadataObjectDefinition } from "@gooddata/sdk-model";

import type { ComputedAttributeSchema } from "./computedAttributeSchema.js";

/**
 * Canonical AAC computed attribute object with an optional `id`.
 *
 * The `id` is dropped when a computed attribute is created or duplicated so the server derives one;
 * a loaded computed attribute always carries it. Field names otherwise mirror
 * `@gooddata/sdk-code-schemas` `v1.ComputedAttribute`.
 */
export type ComputedAttributeYaml = Omit<v1.ComputedAttribute, "id"> & { id?: string };

/**
 * Maps a computed attribute definition (or a loaded computed attribute, which is a superset) to the
 * canonical AAC object for YAML serialization.
 *
 * Optional meta fields are omitted when empty so the rendered YAML stays terse, matching the
 * analytics-as-code tooling output. The `id` is omitted when the definition has none (e.g. seeding
 * the create dialog from a duplicate) so the server derives a fresh one.
 */
export function definitionToComputedAttributeYaml(
    definition: IComputedAttributeMetadataObjectDefinition,
): ComputedAttributeYaml {
    return {
        type: "computed_attribute",
        ...(definition.id === undefined ? {} : { id: definition.id }),
        title: definition.title,
        ...(definition.description ? { description: definition.description } : {}),
        ...(definition.tags && definition.tags.length > 0 ? { tags: definition.tags } : {}),
        maql: definition.expression,
        ...(definition.locale ? { locale: definition.locale } : {}),
    };
}

/**
 * Maps a validated AAC computed attribute object to a backend computed attribute definition.
 */
export function computedAttributeYamlToDefinition(
    computedAttribute: ComputedAttributeSchema,
): IComputedAttributeMetadataObjectDefinition {
    return {
        type: "computedAttribute",
        ...(computedAttribute.id === undefined ? {} : { id: computedAttribute.id }),
        title: computedAttribute.title ?? "",
        description: computedAttribute.description ?? "",
        tags: computedAttribute.tags ?? [],
        expression: computedAttribute.maql,
        ...(computedAttribute.locale === undefined ? {} : { locale: computedAttribute.locale }),
    };
}

/**
 * The fields the as-code computed attribute YAML owns, extracted from a parsed definition and
 * normalized for persistence. Every other field — `format`, `metricType`, `dataType`, `isNullable`,
 * `nullValue`, and a loaded object's identity (`ref`, `uri`) — lies outside the YAML projection and
 * is preserved by layering these fields over a base object rather than replacing it.
 *
 * `locale` is always returned (normalized to `undefined` when absent), never omitted: it must
 * overwrite the base so that clearing the `locale` line drops a previously set collation. Were it
 * omitted when undefined, the base's stale `locale` would leak through the overlay.
 */
function pickComputedAttributeYamlFields(
    definition: IComputedAttributeMetadataObjectDefinition,
): Pick<
    IComputedAttributeMetadataObjectDefinition,
    "title" | "description" | "tags" | "expression" | "locale"
> {
    return {
        title: definition.title ?? "",
        description: definition.description ?? "",
        tags: definition.tags ?? [],
        expression: definition.expression,
        locale: definition.locale,
    };
}

/**
 * The computed attribute's `reconcile`: layers the author's parsed YAML edits over the base
 * definition — the loaded object on an edit, the copy source on a duplicate.
 *
 * The base carries fields the YAML cannot express (`format`, `metricType`, `dataType`, ...), which
 * survive because only the YAML-owned fields are overlaid on top. Identity stays YAML-authoritative:
 * the parsed `id` wins, and its absence lets the server derive a fresh one, so the base's id is
 * intentionally dropped first. (On an edit this is moot — validation pins the parsed id to the loaded
 * object's — but on a duplicate it is what frees the copy from the source's identity.)
 */
export function reconcileComputedAttributeDefinition(
    base: IComputedAttributeMetadataObjectDefinition,
    edited: IComputedAttributeMetadataObjectDefinition,
): IComputedAttributeMetadataObjectDefinition {
    const { id: _baseId, ...carriedOver } = base;
    return {
        ...carriedOver,
        ...pickComputedAttributeYamlFields(edited),
        ...(edited.id === undefined ? {} : { id: edited.id }),
    };
}
