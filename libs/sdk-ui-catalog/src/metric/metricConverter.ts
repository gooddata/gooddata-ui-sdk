// (C) 2026 GoodData Corporation

import type { v1 } from "@gooddata/sdk-code-schemas";
import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import type { MetricSchema } from "./metricSchema.js";

/**
 * Canonical AAC metric object with an optional `id`.
 *
 * The `id` is dropped when a metric is created or duplicated so the server derives one; a loaded
 * metric always carries it. Field names otherwise mirror `@gooddata/sdk-code-schemas` `v1.Metric`.
 */
export type MetricYaml = Omit<v1.Metric, "id"> & { id?: string };

/**
 * Maps a measure definition (or a loaded measure, which is a superset) to the canonical AAC metric
 * object for YAML serialization.
 *
 * Optional meta fields are omitted when empty so the rendered YAML stays terse, matching the
 * analytics-as-code tooling output; a hidden metric is expressed as `show_in_ai_results: false`.
 * The `id` is omitted when the definition has none (e.g. seeding the create dialog from a duplicate)
 * so the server derives a fresh one; a loaded measure always carries it.
 */
export function definitionToMetricYaml(definition: IMeasureMetadataObjectDefinition): MetricYaml {
    return {
        type: "metric",
        ...(definition.id === undefined ? {} : { id: definition.id }),
        title: definition.title,
        ...(definition.description ? { description: definition.description } : {}),
        ...(definition.tags && definition.tags.length > 0 ? { tags: definition.tags } : {}),
        maql: definition.expression,
        ...(definition.format ? { format: definition.format } : {}),
        ...(definition.isHidden === true ? { show_in_ai_results: false } : {}),
    };
}

/**
 * Maps a validated AAC metric object to a backend measure definition.
 *
 * `show_in_ai_results` takes precedence over the deprecated `is_hidden` when both are present.
 */
export function metricYamlToDefinition(metric: MetricSchema): IMeasureMetadataObjectDefinition {
    const isHidden = resolveIsHidden(metric);
    return {
        type: "measure",
        ...(metric.id === undefined ? {} : { id: metric.id }),
        title: metric.title ?? "",
        description: metric.description ?? "",
        tags: metric.tags ?? [],
        expression: metric.maql,
        format: metric.format ?? "",
        ...(isHidden === undefined ? {} : { isHidden }),
    };
}

function resolveIsHidden(metric: MetricSchema): boolean | undefined {
    if (metric.show_in_ai_results !== undefined) {
        return metric.show_in_ai_results === false;
    }
    if (metric.is_hidden !== undefined) {
        return metric.is_hidden;
    }
    return undefined;
}

/**
 * The fields the as-code metric YAML owns, extracted from a parsed definition and normalized for
 * persistence. Every other field on a measure — `metricType`, `isHiddenFromKda`, and a loaded
 * measure's identity (`ref`, `uri`) — lies outside the YAML projection and is preserved by layering
 * these fields over a base object rather than replacing it.
 *
 * `isHidden` is always returned (normalized to `false` when absent), never omitted: it must
 * overwrite the base so that clearing `show_in_ai_results` unhides a previously hidden metric. Were
 * it omitted when undefined, the base's stale `isHidden` would leak through the overlay.
 */
function pickMetricYamlFields(
    definition: IMeasureMetadataObjectDefinition,
): Pick<
    IMeasureMetadataObjectDefinition,
    "title" | "description" | "tags" | "expression" | "format" | "isHidden"
> {
    return {
        title: definition.title ?? "",
        description: definition.description ?? "",
        tags: definition.tags ?? [],
        expression: definition.expression,
        format: definition.format ?? "",
        isHidden: definition.isHidden ?? false,
    };
}

/**
 * The metric's `reconcile`: layers the author's parsed YAML edits over the base definition — the
 * loaded measure on an edit, the copy source on a duplicate.
 *
 * The base carries fields the YAML cannot express (`metricType`, `isHiddenFromKda`), which survive
 * because only the YAML-owned fields are overlaid on top. Identity stays YAML-authoritative: the
 * parsed `id` wins, and its absence lets the server derive a fresh one, so the base's id is
 * intentionally dropped first. (On an edit this is moot — validation pins the parsed id to the loaded
 * object's — but on a duplicate it is what frees the copy from the source's identity.)
 */
export function reconcileMetricDefinition(
    base: IMeasureMetadataObjectDefinition,
    edited: IMeasureMetadataObjectDefinition,
): IMeasureMetadataObjectDefinition {
    const { id: _baseId, ...carriedOver } = base;
    return {
        ...carriedOver,
        ...pickMetricYamlFields(edited),
        ...(edited.id === undefined ? {} : { id: edited.id }),
    };
}
