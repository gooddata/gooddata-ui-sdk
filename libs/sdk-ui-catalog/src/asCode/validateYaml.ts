// (C) 2026 GoodData Corporation

import { parse as parseYaml } from "yaml";
import type * as z from "zod/mini";

import type { AsCodeFieldMark } from "./descriptor.js";

type SafeParseSchema<TData> = {
    safeParse(value: unknown): { success: true; data: TData } | { success: false; error: z.core.$ZodError };
};

type YamlErrorCode = "empty" | "syntax" | "invalidStructure" | "idImmutable";

// A shared failure carries none of the type's own fields; naming them absent keeps them readable on
// the whole union.
type SharedYamlFailure<TFailure> = { errorCode: YamlErrorCode } & {
    [TKey in Exclude<keyof TFailure, "errorCode">]?: undefined;
};

export type YamlValidationFailure<TFailure extends { errorCode: string }> = {
    isValid: false;
} & AsCodeFieldMark &
    (TFailure | SharedYamlFailure<TFailure>);

export type YamlValidation<TData, TFailure extends { errorCode: string }> =
    | { isValid: true; data: TData }
    | YamlValidationFailure<TFailure>;

type ValidateYamlOptions<TData, TFailure> = {
    schema: SafeParseSchema<TData>;
    /** When set, the parsed `id` must match it, else `idImmutable` (identity is fixed while editing). */
    fixedIdentifier?: string;
    classifyIssue: (dottedPath: string, parsed: unknown, issue: z.core.$ZodIssue) => TFailure | undefined;
};

export function validateYaml<TData extends { id?: string }, TFailure extends { errorCode: string }>(
    value: string,
    { schema, fixedIdentifier, classifyIssue }: ValidateYamlOptions<TData, TFailure>,
): YamlValidation<TData, TFailure> {
    if (value.trim() === "") {
        return { isValid: false, errorCode: "empty" };
    }

    let parsed: unknown;
    try {
        parsed = parseYaml(value, { strict: true });
    } catch {
        return { isValid: false, errorCode: "syntax" };
    }

    const document = withoutBlankIdentity(parsed);
    const result = schema.safeParse(document);
    if (!result.success) {
        for (const issue of result.error.issues) {
            const failure = classifyIssue(issue.path.map(String).join("."), document, issue);
            if (failure) {
                return { isValid: false, ...failure, ...markedField(issue) };
            }
        }
        return { isValid: false, errorCode: "invalidStructure", ...markedField(result.error.issues[0]) };
    }

    if (fixedIdentifier !== undefined && result.data.id !== fixedIdentifier) {
        return { isValid: false, errorCode: "idImmutable", path: ["id"] };
    }

    return { isValid: true, data: result.data };
}

/**
 * A blank `maql:` / `maql: ` line parses to null - the seeded template's state - and counts as
 * unwritten, not as a value of the wrong type.
 */
export function isMaqlWritten(parsed: unknown): boolean {
    return parsed !== null && typeof parsed === "object" && "maql" in parsed && parsed.maql != null;
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

/**
 * The field to mark for an issue. Symbols cannot name a YAML node, so they are dropped, and an empty
 * path names no field. Zod reports an unknown key on its parent object, so the first unknown key is
 * appended and marked by its key.
 */
function markedField(issue: z.core.$ZodIssue): AsCodeFieldMark {
    if (issue.code === "unrecognized_keys") {
        return { path: [...issue.path.filter(isDocumentKey), issue.keys[0]], target: "key" };
    }
    const keys = issue.path.filter(isDocumentKey);
    return { path: keys.length > 0 ? keys : undefined };
}

function isDocumentKey(key: PropertyKey): key is string | number {
    return typeof key !== "symbol";
}
