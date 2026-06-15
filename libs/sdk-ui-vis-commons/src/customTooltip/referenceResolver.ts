// (C) 2026 GoodData Corporation

import { REFERENCE_REGEX_MATCH } from "@gooddata/sdk-ui-kit";

import { URL_PATTERN } from "./markdownToHtml.js";
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

// Prefix is matched case-insensitively (`metric` | `label`); LDM identifiers are case-sensitive.
function lookupRef(
    values: IResolvedReferenceValues,
    prefix: string,
    identifier: string,
): ResolvedReference | undefined {
    return values[prefix.toLowerCase() === "metric" ? metricKey(identifier) : labelKey(identifier)];
}

// In image/link URL targets a no-data reference must collapse to empty rather than
// the "(No data)" placeholder, which would break markdown parsing and leak the raw
// `![alt](...)` syntax. Blanking yields a broken image / empty-href link, matching
// RichText. Image alt is blanked too; link text keeps the normal placeholder.
// Slot grammar mirrors `markdownToHtml` (shared URL_PATTERN, single-line slots),
// so blanking applies only where the renderer will actually see an image/link.
const IMAGE_CONSTRUCT_REGEX = new RegExp(`!\\[([^\\]\\n]*)\\]\\((${URL_PATTERN})?\\)`, "g");
const LINK_CONSTRUCT_REGEX = new RegExp(`(?<!!)\\[([^\\]\\n]+)\\]\\((${URL_PATTERN})?\\)`, "g");

function blankNonValueRefs(slot: string, values: IResolvedReferenceValues): string {
    return slot.replace(
        REFERENCE_REGEX_MATCH,
        (fullMatch: string, _wrapped: string, _key: string, prefix: string, identifier: string) =>
            lookupRef(values, prefix, identifier)?.kind === "value" ? fullMatch : "",
    );
}

function blankNonValueTargets(content: string, values: IResolvedReferenceValues): string {
    return content
        .replace(
            IMAGE_CONSTRUCT_REGEX,
            (_match: string, alt: string, url = "") =>
                `![${blankNonValueRefs(alt, values)}](${blankNonValueRefs(url, values)})`,
        )
        .replace(
            LINK_CONSTRUCT_REGEX,
            (_match: string, text: string, url = "") => `[${text}](${blankNonValueRefs(url, values)})`,
        );
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

    // Blank no-data image/link targets first, before they reach substitution.
    return blankNonValueTargets(content, values).replace(
        REFERENCE_REGEX_MATCH,
        (_fullMatch: string, _wrapped: string, _key: string, prefix: string, identifier: string) =>
            escapeMarkdownMetachars(renderReference(lookupRef(values, prefix, identifier), strings)),
    );
}
