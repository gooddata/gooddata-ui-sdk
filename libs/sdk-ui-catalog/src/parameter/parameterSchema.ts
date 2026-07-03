// (C) 2026 GoodData Corporation

import { union } from "lodash-es";
import * as z from "zod/mini";

import type { IParameterDefinition } from "@gooddata/sdk-model";

const numberConstraintsSchema = z
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

const stringConstraintsSchema = z.strictObject({
    minLength: z.optional(z.number()),
    maxLength: z.optional(z.number()),
});

/** One arm per model type; `satisfies` breaks the build if the model gains a type without an arm. */
const definitionSchemas = {
    NUMBER: z.strictObject({
        type: z.literal("NUMBER"),
        defaultValue: z.number(),
        constraints: z.optional(numberConstraintsSchema),
    }),
    STRING: z.strictObject({
        type: z.literal("STRING"),
        defaultValue: z.string(),
        constraints: z.optional(stringConstraintsSchema),
    }),
} satisfies Record<IParameterDefinition["type"], z.core.$ZodType>;

/** Policy knob: the types the UI validates. Others still display via the seed but are rejected at submit. */
const supportedDefinitionSchemas = [definitionSchemas.NUMBER] as const;

const definitionSchema = z.discriminatedUnion("type", supportedDefinitionSchemas);

export const parameterSchema = z.strictObject({
    type: z._default(z.literal("parameter"), "parameter"),
    id: z.optional(z.string()),
    title: z.optional(z.string()),
    description: z.optional(z.string()),
    tags: z.optional(z.array(z.string())),
    definition: definitionSchema,
});

export type ParameterSchemaInput = z.input<typeof parameterSchema>;
export type ParameterSchema = z.infer<typeof parameterSchema>;

export const PARAMETER_SCHEMA_KEYS = deriveSchemaKeys(parameterSchema);

/** Map of parent key → allowed child keys, powering YAML editor autocompletion. */
function deriveSchemaKeys(
    schema: z.core.$ZodType,
    parentKey = "",
    result: Record<string, string[]> = {},
): Record<string, string[]> {
    for (const object of objectSchemasOf(schema)) {
        const { shape } = object._zod.def as z.core.$ZodObjectDef;
        result[parentKey] = union(result[parentKey], Object.keys(shape));

        for (const [key, child] of Object.entries(shape)) {
            deriveSchemaKeys(unwrap(child), key, result);
        }
    }

    return result;
}

/** Object schemas reachable from `schema`, flattening a discriminated union into its arms. */
function objectSchemasOf(schema: z.core.$ZodType): z.core.$ZodType[] {
    const { def } = schema._zod;
    if (def.type === "object") {
        return [schema];
    }
    if (def.type === "union") {
        return (def as z.core.$ZodUnionDef).options.flatMap((option) => objectSchemasOf(unwrap(option)));
    }
    return [];
}

function unwrap(schema: z.core.$ZodType): z.core.$ZodType {
    const { type } = schema._zod.def;
    if (type === "optional" || type === "default") {
        return unwrap((schema._zod.def as z.core.$ZodOptionalDef).innerType);
    }
    return schema;
}
