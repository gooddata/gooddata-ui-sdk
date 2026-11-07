// (C) 2026 GoodData Corporation

import * as z from "zod/mini";

import type { AacSchemaParity, AssertAacParity } from "../asCode/aacParity.js";
import { type SchemaKeys, deriveSchemaKeys } from "../asCode/schemaKeys.js";
import type { ObjectTypes } from "../objectType/constants.js";

/**
 * Zod schema for the analytics-as-code (AAC) metric YAML shape.
 *
 * Field names and structure mirror the canonical AAC metric definition
 * (`@gooddata/sdk-code-schemas` `v1.Metric`) so YAML authored here is interchangeable
 * with metrics produced by the analytics-as-code tooling. `id` is optional because the
 * server derives one from the title when it is omitted on create.
 */
export const metricSchema = z.strictObject({
    type: z._default(z.literal("metric"), "metric"),
    id: z.optional(z.string()),
    title: z.optional(z.string()),
    description: z.optional(z.string()),
    tags: z.optional(z.array(z.string())),
    maql: z.string(),
    format: z.optional(z.string()),
    show_in_ai_results: z.optional(z.boolean()),
    // Deprecated predecessor of `show_in_ai_results`; accepted so AAC exports still parse.
    is_hidden: z.optional(z.boolean()),
});

export type MetricSchemaInput = z.input<typeof metricSchema>;
export type MetricSchema = z.infer<typeof metricSchema>;

/** Fails the build when this schema drifts from the AAC `metric` document type. */
export type MetricAacParity = AssertAacParity<AacSchemaParity<typeof ObjectTypes.METRIC, MetricSchema>>;

export const METRIC_SCHEMA_KEYS: SchemaKeys = deriveSchemaKeys(metricSchema);
