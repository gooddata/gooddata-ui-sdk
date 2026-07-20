// (C) 2026 GoodData Corporation

import { parse as parseYaml } from "yaml";
import type * as z from "zod/mini";

/**
 * Neutral result of the shared YAML validation skeleton, before a type shapes it into its own
 * result. `data` is the parsed-and-schema-validated value; the caller converts it to a definition.
 */
export type YamlValidation<TData, TErrorCode extends string> =
    | { ok: true; data: TData }
    | { ok: false; errorCode: TErrorCode | "empty" | "syntax" | "idImmutable" };

type SafeParseSchema<TData> = {
    safeParse(value: unknown): { success: true; data: TData } | { success: false; error: z.core.$ZodError };
};

type ValidateYamlOptions<TData, TErrorCode extends string> = {
    schema: SafeParseSchema<TData>;
    /** Maps a schema failure to a type-specific error code. */
    classifyError: (error: z.core.$ZodError, parsed: unknown) => TErrorCode;
    /** When set, the parsed `id` must match it, else `idImmutable` (identity is fixed while editing). */
    fixedIdentifier?: string;
};

/**
 * Runs the steps every as-code YAML shares: reject empty input, parse (strict) YAML, validate
 * against the schema, and enforce identity immutability. Type-specific concerns — the schema, how a
 * schema failure maps to an error code, and how the validated data becomes a definition — are the
 * caller's.
 */
export function validateYaml<TData extends { id?: string }, TErrorCode extends string>(
    value: string,
    { schema, classifyError, fixedIdentifier }: ValidateYamlOptions<TData, TErrorCode>,
): YamlValidation<TData, TErrorCode> {
    if (value.trim() === "") {
        return { ok: false, errorCode: "empty" };
    }

    let parsed: unknown;
    try {
        parsed = parseYaml(value, { strict: true });
    } catch {
        return { ok: false, errorCode: "syntax" };
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
        return { ok: false, errorCode: classifyError(result.error, parsed) };
    }

    if (fixedIdentifier !== undefined && result.data.id !== fixedIdentifier) {
        return { ok: false, errorCode: "idImmutable" };
    }

    return { ok: true, data: result.data };
}
