// (C) 2026 GoodData Corporation

import { parse as parseYaml } from "yaml";
import type * as z from "zod/mini";

/**
 * Neutral result of the shared YAML validation skeleton, before a type shapes it into its own result.
 * `data` is the parsed-and-schema-validated value; the caller converts it to a definition. A `schema`
 * failure hands the caller the `error` and the `parsed` value to classify against its own error codes;
 * the other kinds are already the codes every as-code type shares.
 */
export type YamlValidation<TData> =
    | { ok: true; data: TData }
    | { ok: false; kind: "empty" | "syntax" | "idImmutable" }
    | { ok: false; kind: "schema"; error: z.core.$ZodError; parsed: unknown };

type SafeParseSchema<TData> = {
    safeParse(value: unknown): { success: true; data: TData } | { success: false; error: z.core.$ZodError };
};

type ValidateYamlOptions<TData> = {
    schema: SafeParseSchema<TData>;
    /** When set, the parsed `id` must match it, else `idImmutable` (identity is fixed while editing). */
    fixedIdentifier?: string;
};

/**
 * Runs the steps every as-code YAML shares: reject empty input, parse (strict) YAML, validate against
 * the schema, and enforce identity immutability. The schema itself and the conversion of validated data
 * into a definition are the caller's.
 */
export function validateYaml<TData extends { id?: string }>(
    value: string,
    { schema, fixedIdentifier }: ValidateYamlOptions<TData>,
): YamlValidation<TData> {
    if (value.trim() === "") {
        return { ok: false, kind: "empty" };
    }

    let parsed: unknown;
    try {
        parsed = parseYaml(value, { strict: true });
    } catch {
        return { ok: false, kind: "syntax" };
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
        return { ok: false, kind: "schema", error: result.error, parsed };
    }

    if (fixedIdentifier !== undefined && result.data.id !== fixedIdentifier) {
        return { ok: false, kind: "idImmutable" };
    }

    return { ok: true, data: result.data };
}
