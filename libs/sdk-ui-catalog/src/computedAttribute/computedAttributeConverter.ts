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
 * Optional fields are omitted when unset so the rendered YAML stays terse, matching the
 * analytics-as-code tooling output; a hidden computed attribute is expressed as
 * `show_in_ai_results: false`. The `id` is omitted when the definition has none (e.g. seeding the
 * create dialog from a duplicate) so the server derives a fresh one.
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
        ...(definition.format ? { format: definition.format } : {}),
        ...(definition.metricType === undefined ? {} : { metric_type: definition.metricType }),
        ...(definition.dataType === undefined ? {} : { data_type: definition.dataType }),
        ...(definition.valueType === undefined ? {} : { value_type: definition.valueType }),
        ...(definition.isNullable === undefined ? {} : { is_nullable: definition.isNullable }),
        ...(definition.nullValue === undefined ? {} : { null_value_join_replacement: definition.nullValue }),
        ...(definition.isHidden === true ? { show_in_ai_results: false } : {}),
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
        ...(computedAttribute.format === undefined ? {} : { format: computedAttribute.format }),
        ...(computedAttribute.metric_type === undefined ? {} : { metricType: computedAttribute.metric_type }),
        ...(computedAttribute.data_type === undefined ? {} : { dataType: computedAttribute.data_type }),
        ...(computedAttribute.value_type === undefined ? {} : { valueType: computedAttribute.value_type }),
        ...(computedAttribute.is_nullable === undefined ? {} : { isNullable: computedAttribute.is_nullable }),
        ...(computedAttribute.null_value_join_replacement === undefined
            ? {}
            : { nullValue: computedAttribute.null_value_join_replacement }),
        ...(computedAttribute.show_in_ai_results === undefined
            ? {}
            : { isHidden: computedAttribute.show_in_ai_results === false }),
        ...(computedAttribute.locale === undefined ? {} : { locale: computedAttribute.locale }),
    };
}

/**
 * The fields the as-code computed attribute YAML owns, extracted from a parsed definition and
 * normalized for persistence. Only a loaded object's identity and server-managed state (`ref`, `uri`,
 * `isLocked`, `dataSet`, `certification`, `displayForms`, audit fields) lie outside the YAML
 * projection and are preserved by layering these fields over a base object rather than replacing it.
 *
 * Every optional field is always returned (normalized to `undefined` when absent, `isHidden` to
 * `false`), never omitted: it must overwrite the base so that removing a line drops the previously
 * set value. Were a field omitted when undefined, the base's stale value would leak through the overlay.
 */
function pickComputedAttributeYamlFields(
    definition: IComputedAttributeMetadataObjectDefinition,
): Pick<
    IComputedAttributeMetadataObjectDefinition,
    | "title"
    | "description"
    | "tags"
    | "expression"
    | "format"
    | "metricType"
    | "dataType"
    | "valueType"
    | "isNullable"
    | "nullValue"
    | "isHidden"
    | "locale"
> {
    return {
        title: definition.title ?? "",
        description: definition.description ?? "",
        tags: definition.tags ?? [],
        expression: definition.expression,
        format: definition.format,
        metricType: definition.metricType,
        dataType: definition.dataType,
        valueType: definition.valueType,
        isNullable: definition.isNullable,
        nullValue: definition.nullValue,
        isHidden: definition.isHidden ?? false,
        locale: definition.locale,
    };
}

/**
 * The computed attribute's `reconcile`: layers the author's parsed YAML edits over the base
 * definition — the loaded object on an edit, the copy source on a duplicate.
 *
 * The base carries what the YAML cannot express (identity and server-managed state), which survives
 * because only the YAML-owned fields are overlaid on top. Identity stays YAML-authoritative: the
 * parsed `id` wins, and its absence lets the server derive a fresh one, so the base's id is
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
