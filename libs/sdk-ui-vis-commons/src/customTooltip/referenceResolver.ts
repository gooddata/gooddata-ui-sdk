// (C) 2026 GoodData Corporation

import { REFERENCE_REGEX_MATCH } from "@gooddata/sdk-ui-kit";

import {
    type IResolvedReferenceValues,
    type ITooltipLocalizedStrings,
    type ResolvedReference,
    labelKey,
    metricKey,
} from "./types.js";

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
 * Renders a single resolved reference status to its display string. A reference
 * with no status at this point (e.g. an in-chart sibling not present on the
 * hovered series) is surfaced as unretrievable rather than masked as "no data".
 */
function renderReference(ref: ResolvedReference | undefined, strings: ITooltipLocalizedStrings): string {
    switch (ref?.kind) {
        case "value":
            return ref.text;
        case "empty":
            return strings.noData;
        case "multiple":
            return strings.multipleItems;
        case undefined:
            // Absent reference → couldn't be resolved at this point.
            return strings.noFetch;
    }
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
 * @param values - Lookup of `metric/id` and `label/id` keys to resolved statuses.
 *   Keys must use a lowercase prefix; LDM identifiers are case-sensitive.
 * @param strings - Localized placeholders for the non-value states (no data,
 *   multiple items, could-not-retrieve).
 *
 * @internal
 */
export function resolveReferences(
    content: string,
    values: IResolvedReferenceValues,
    strings: ITooltipLocalizedStrings,
): string {
    if (!content) {
        return "";
    }

    return content.replace(REFERENCE_REGEX_MATCH, (_fullMatch, _wrapped, _key, prefix, identifier) => {
        // The regex captures the prefix case-insensitively (`metric` | `label`);
        // route through the key helpers so the lookup format stays single-sourced
        // with the write sites. LDM identifiers stay as-is — they are case-sensitive.
        const key = prefix.toLowerCase() === "metric" ? metricKey(identifier) : labelKey(identifier);
        return escapeMarkdownMetachars(renderReference(values[key], strings));
    });
}
