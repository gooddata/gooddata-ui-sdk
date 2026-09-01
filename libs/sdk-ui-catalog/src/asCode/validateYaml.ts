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
 * Runs the steps every as-code YAML shares: reject empty input, parse (strict) YAML, drop a blank
 * identity, validate against the schema, and enforce identity immutability. The schema itself and the
 * conversion of validated data into a definition are the caller's.
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

    const document = withoutBlankIdentity(parsed);
    const result = schema.safeParse(document);
    if (!result.success) {
        return { ok: false, kind: "schema", error: result.error, parsed: document };
    }

    if (fixedIdentifier !== undefined && result.data.id !== fixedIdentifier) {
        return { ok: false, kind: "idImmutable" };
    }

    return { ok: true, data: result.data };
}

/**
 * Drops an `id` the author left blank, so the template can offer the key without forcing a value.
 *
 * The seeded template renders `id: ` for an object that has none yet; left untouched it parses to
 * `null`, and a whitespace-only value to a blank string. Either means "no identity chosen" — the
 * server derives one on create — so the key is removed rather than passed on as a value the schema
 * would reject or the backend would take literally.
 */
function withoutBlankIdentity(parsed: unknown): unknown {
    if (!parsed || typeof parsed !== "object" || !("id" in parsed)) {
        return parsed;
    }
    const { id, ...rest } = parsed as { id?: unknown };
    return id === null || (typeof id === "string" && id.trim() === "") ? rest : parsed;
}
