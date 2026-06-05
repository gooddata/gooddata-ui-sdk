// (C) 2026 GoodData Corporation

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type ISeparators } from "@gooddata/sdk-model";

import { type ResolvedReference } from "./types.js";

/**
 * Maps a raw measure value to a {@link ResolvedReference} status: `null`/
 * `undefined` → empty ("No data"); otherwise the formatted (or stringified)
 * value. Shared by every tooltip resolver so the value→status mapping has a
 * single home. Callers whose source can yield non-numeric / non-finite values
 * (e.g. geo feature payloads) normalize those to `null` before calling.
 *
 * @internal
 */
export function measureReference(
    rawValue: number | string | null | undefined,
    format: string | undefined,
    separators?: ISeparators,
): ResolvedReference {
    if (rawValue == null) {
        return { kind: "empty" };
    }
    if (format) {
        const { formattedValue } = ClientFormatterFacade.formatValue(Number(rawValue), format, separators);
        return { kind: "value", text: formattedValue };
    }
    return { kind: "value", text: String(rawValue) };
}

/**
 * Maps a label/attribute display value to a {@link ResolvedReference} status:
 * `null` / `undefined` / empty string → empty ("No data"); otherwise the value.
 * Shared by every tooltip resolver so empty-value handling can't drift between
 * the in-chart and external paths. The count-based "multiple" case stays with
 * the caller (only the lookup builder knows the per-row count).
 *
 * @internal
 */
export function labelReference(value: string | number | null | undefined): ResolvedReference {
    return value == null || value === "" ? { kind: "empty" } : { kind: "value", text: String(value) };
}
