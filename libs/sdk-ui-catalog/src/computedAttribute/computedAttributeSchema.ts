// (C) 2026 GoodData Corporation

import * as z from "zod/mini";

import type { ComputedAttributeDataType, ComputedAttributeValueType, MetricType } from "@gooddata/sdk-model";

import type { AacSchemaParity, AssertAacParity } from "../asCode/aacParity.js";
import type { ObjectTypes } from "../objectType/constants.js";

/**
 * The value lists mirror the sdk-model unions the definition is typed with. `satisfies` makes a value
 * the model does not know a compile error, and the reverse check below makes a model value the list
 * forgot one too, so the two cannot drift apart silently.
 */
const DATA_TYPES = [
    "INT",
    "STRING",
    "DATE",
    "NUMERIC",
    "TIMESTAMP",
    "TIMESTAMP_TZ",
    "BOOLEAN",
    "HLL",
] as const satisfies readonly ComputedAttributeDataType[];
const VALUE_TYPES = [
    "TEXT",
    "HYPERLINK",
    "GEO",
    "GEO_LONGITUDE",
    "GEO_LATITUDE",
    "GEO_AREA",
    "GEO_ICON",
    "IMAGE",
    "HYPERLOGLOG",
] as const satisfies readonly ComputedAttributeValueType[];
const METRIC_TYPES = ["UNSPECIFIED", "CURRENCY"] as const satisfies readonly MetricType[];

type Assert<T extends true> = T;
type Covers<TList extends readonly string[], TUnion extends string> = [TUnion] extends [TList[number]]
    ? true
    : false;
export type DataTypesCoverModel = Assert<Covers<typeof DATA_TYPES, ComputedAttributeDataType>>;
export type ValueTypesCoverModel = Assert<Covers<typeof VALUE_TYPES, ComputedAttributeValueType>>;
export type MetricTypesCoverModel = Assert<Covers<typeof METRIC_TYPES, MetricType>>;

/**
 * BCP 47 shape a `locale` must have: a 2 or 3 letter language followed by dash-separated alphanumeric
 * subtags (for example `en-US` or `cs-CZ-u-kn-true`). The same pattern the analytics-as-code schema
 * applies to label and computed attribute locales; the backend performs the authoritative check.
 */
export const LOCALE_PATTERN = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{1,8})*$/;

/**
 * Zod schema for the analytics-as-code (AAC) computed attribute YAML shape.
 *
 * Field names and structure mirror the canonical AAC computed attribute definition
 * (`@gooddata/sdk-code-schemas` `v1.ComputedAttribute`) so YAML authored here is interchangeable
 * with computed attributes produced by the analytics-as-code tooling. `id` is optional because the
 * server derives one from the title when it is omitted on create.
 */
export const computedAttributeSchema = z.strictObject({
    type: z._default(z.literal("computed_attribute"), "computed_attribute"),
    id: z.optional(z.string()),
    title: z.optional(z.string()),
    description: z.optional(z.string()),
    tags: z.optional(z.array(z.string())),
    maql: z.string(),
    format: z.optional(z.string()),
    metric_type: z.optional(z.enum(METRIC_TYPES)),
    data_type: z.optional(z.enum(DATA_TYPES)),
    value_type: z.optional(z.enum(VALUE_TYPES)),
    is_nullable: z.optional(z.boolean()),
    null_value_join_replacement: z.optional(z.string()),
    show_in_ai_results: z.optional(z.boolean()),
    locale: z.optional(z.string().check(z.regex(LOCALE_PATTERN))),
});

export type ComputedAttributeSchemaInput = z.input<typeof computedAttributeSchema>;
export type ComputedAttributeSchema = z.infer<typeof computedAttributeSchema>;

/** Fails the build when this schema drifts from the AAC `computed_attribute` document type. */
export type ComputedAttributeAacParity = AssertAacParity<
    AacSchemaParity<typeof ObjectTypes.COMPUTED_ATTRIBUTE, ComputedAttributeSchema>
>;

/**
 * Allowed YAML property names keyed by parent mapping, used to power editor autocompletion.
 * The computed attribute schema is flat, so the only entry is the top-level mapping (keyed by `""`),
 * whose value is the object's property names read from zod's public `shape`.
 */
export const COMPUTED_ATTRIBUTE_SCHEMA_KEYS: Record<string, string[]> = {
    "": Object.keys(computedAttributeSchema.shape),
};
