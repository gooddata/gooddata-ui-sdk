// (C) 2026 GoodData Corporation

import { union } from "lodash-es";
import type * as z from "zod/mini";

/**
 * Child keys reachable under a parent key: directly in its mapping, or inside each item of its
 * sequence. A sequence of scalars has no keys.
 */
export type SchemaKeysEntry = {
    kind: "mapping" | "sequence";
    keys: string[];
};

/** Parent key → child-key entry, the root mapping keyed by `""`; powers YAML editor autocompletion. */
export type SchemaKeys = Record<string, SchemaKeysEntry>;

export function deriveSchemaKeys(schema: z.core.$ZodType): SchemaKeys {
    return collectSchemaKeys(schema, "", "mapping", {});
}

function collectSchemaKeys(
    schema: z.core.$ZodType,
    parentKey: string,
    kind: SchemaKeysEntry["kind"],
    result: SchemaKeys,
): SchemaKeys {
    for (const object of objectSchemasOf(schema)) {
        const { shape } = object._zod.def as z.core.$ZodObjectDef;
        result[parentKey] = { kind, keys: union(result[parentKey]?.keys, Object.keys(shape)) };

        for (const [key, child] of Object.entries(shape)) {
            const inner = unwrap(child);
            if (inner._zod.def.type === "array") {
                // A sequence is a block even when its items are scalars and add no keys.
                result[key] ??= { kind: "sequence", keys: [] };
                const element = unwrap((inner._zod.def as z.core.$ZodArrayDef).element);
                collectSchemaKeys(element, key, "sequence", result);
            } else {
                collectSchemaKeys(inner, key, "mapping", result);
            }
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
    if (type === "pipe") {
        return unwrap((schema._zod.def as z.core.$ZodPipeDef).in);
    }
    return schema;
}
