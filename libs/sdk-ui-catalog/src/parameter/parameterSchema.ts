// (C) 2026 GoodData Corporation

import * as z from "zod/mini";

const constraintsSchema = z
    .strictObject({
        min: z.optional(z.number()),
        max: z.optional(z.number()),
    })
    .check((ctx) => {
        const { min, max } = ctx.value;
        if (min !== undefined && max !== undefined && min > max) {
            ctx.issues.push({
                code: "custom",
                message: "invalidConstraintRange",
                input: ctx.value,
                path: [],
            });
        }
    });

const definitionSchema = z.strictObject({
    type: z.literal("NUMBER"),
    defaultValue: z.number(),
    constraints: z.optional(constraintsSchema),
});

export const parameterSchema = z.strictObject({
    type: z._default(z.literal("parameter"), "parameter"),
    id: z.optional(z.string()),
    title: z.optional(z.string()),
    description: z.optional(z.string()),
    tags: z.optional(z.array(z.string())),
    definition: definitionSchema,
});

export const PARAMETER_SCHEMA_KEYS = deriveSchemaKeys(parameterSchema);

/**
 * Derives a map of parent key → allowed child keys from a zod object schema.
 * Used to power YAML editor autocompletion.
 */
function deriveSchemaKeys(
    schema: z.core.$ZodType,
    parentKey = "",
    result: Record<string, string[]> = {},
): Record<string, string[]> {
    const { shape } = schema._zod.def as unknown as { shape: Record<string, z.core.$ZodType> };
    result[parentKey] = Object.keys(shape);

    for (const [key, child] of Object.entries(shape)) {
        const inner = unwrap(child);
        if (inner._zod.def.type === "object") {
            deriveSchemaKeys(inner, key, result);
        }
    }

    return result;
}

function unwrap(schema: z.core.$ZodType): z.core.$ZodType {
    const { type } = schema._zod.def;
    if (type === "optional" || type === "default") {
        return unwrap((schema._zod.def as unknown as { innerType: z.core.$ZodType }).innerType);
    }
    return schema;
}
