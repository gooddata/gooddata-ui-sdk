// (C) 2026 GoodData Corporation

import { REFERENCE_REGEX_MATCH } from "@gooddata/sdk-ui-kit";

import { type IResolvedReferenceValues } from "./types.js";

// Markdown metacharacters that, if present in a substituted value, would be
// reinterpreted as formatting by `markdownToHtml`. Backslash-escape them so the
// parser treats them as literal text. The set covers every char that can start
// or end a markdown construct supported by our parser: emphasis, link/image
// brackets, parens, headings, lists, and horizontal rules.
const MARKDOWN_METACHARS = /[\\*_`\[\]()!#~+\-]/g;

function escapeMarkdownMetachars(value: string): string {
    return value.replace(MARKDOWN_METACHARS, "\\$&");
}

/**
 * Substitutes `{metric/id}` and `{label/id}` references in markdown content
 * with resolved values from the lookup table.
 *
 * Substituted values come from data and may contain markdown metacharacters
 * (e.g., `*`, `_`, `[`). They are backslash-escaped so the downstream
 * markdown-to-HTML conversion renders them as literal text rather than as
 * unintended formatting. `markdownToHtml` understands the backslash escapes.
 *
 * @param content - Markdown content with reference placeholders
 * @param values - Lookup of `metric/id` and `label/id` keys to formatted values.
 *   Keys must use a lowercase prefix; LDM identifiers are case-sensitive.
 * @param fallbackText - Localized text shown when a reference is recognized
 *   but no value is available (unknown identifier, point with no value, etc.).
 *
 * @internal
 */
export function resolveReferences(
    content: string,
    values: IResolvedReferenceValues,
    fallbackText: string,
): string {
    if (!content) {
        return "";
    }

    return content.replace(REFERENCE_REGEX_MATCH, (_fullMatch, _wrapped, _key, prefix, identifier) => {
        // The regex matches the prefix case-insensitively; storage uses
        // lowercase prefixes so users can write either `{metric/foo}` or
        // `{Metric/foo}`. LDM identifiers stay as-is — they are case-sensitive.
        const value = values[`${prefix.toLowerCase()}/${identifier}`];
        return escapeMarkdownMetachars(value === undefined ? fallbackText : value);
    });
}
