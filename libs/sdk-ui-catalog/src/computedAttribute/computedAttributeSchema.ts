// (C) 2026 GoodData Corporation

import * as z from "zod/mini";

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
    locale: z.optional(z.string()),
});

export type ComputedAttributeSchemaInput = z.input<typeof computedAttributeSchema>;
export type ComputedAttributeSchema = z.infer<typeof computedAttributeSchema>;

/**
 * Allowed YAML property names keyed by parent mapping, used to power editor autocompletion.
 * The computed attribute schema is flat, so the only entry is the top-level mapping (keyed by `""`),
 * whose value is the object's property names read from zod's public `shape`.
 */
export const COMPUTED_ATTRIBUTE_SCHEMA_KEYS: Record<string, string[]> = {
    "": Object.keys(computedAttributeSchema.shape),
};
