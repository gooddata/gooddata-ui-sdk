// (C) 2026 GoodData Corporation

/**
 * Reference resolution for custom tooltip content.
 *
 * Parses {metric/id} and {label/id} references in markdown content and
 * substitutes them with resolved values from a lookup table.
 */

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type ISeparators, isMeasureDescriptor } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { REFERENCE_REGEX_MATCH } from "@gooddata/sdk-ui-kit";

import { type IUnsafeHighchartsTooltipPoint } from "../../../typings/unsafe.js";
import { type IIdentifierMapping } from "./identifierMapping.js";

export interface IResolvedValues {
    [referenceKey: string]: string | undefined;
}

/**
 * Builds resolved values from the hovered point's drill intersection.
 *
 * Uses the identifierMapping to translate localIdentifiers (from the drill
 * intersection) to LDM identifiers used in `{metric/id}` references, and to
 * read each measure's value from the correct Highcharts point field — `x`,
 * `y`, `z`, `value`, or `target`, depending on chart type.
 *
 * Without an identifierMapping (or for a measure not present in it) the
 * resolver falls back to `point.y`, which is correct for the single-Y chart
 * family.
 */
export function resolveReferencesFromPoint(
    point: IUnsafeHighchartsTooltipPoint,
    separators?: ISeparators,
    identifierMapping?: IIdentifierMapping,
): IResolvedValues {
    const intersection: IDrillEventIntersectionElement[] = point.drillIntersection ?? [];
    const values: IResolvedValues = {};
    const measureMap = identifierMapping?.measures ?? {};

    for (const element of intersection) {
        const { header } = element;

        if (isDrillIntersectionAttributeItem(header)) {
            // Attribute element — resolve {label/id}
            const displayFormId = header.attributeHeader.identifier;
            const attributeId = header.attributeHeader.formOf.identifier;
            const displayValue =
                header.attributeHeaderItem.formattedName ?? header.attributeHeaderItem.name ?? undefined;

            // Register under both display form and attribute identifiers
            values[`label/${displayFormId}`] = displayValue;
            if (attributeId !== displayFormId) {
                values[`label/${attributeId}`] = displayValue;
            }
        } else if (isMeasureDescriptor(header)) {
            const localId = header.measureHeaderItem.localIdentifier;
            const entry = measureMap[localId];
            const ldmId = header.measureHeaderItem.identifier ?? entry?.ldmId;

            if (!ldmId) {
                continue;
            }

            const format = header.measureHeaderItem.format;
            const pointField = entry?.pointField ?? "y";
            // Bullet's null target is encoded as `target: 0` plus an
            // `isNullTarget` flag — read the flag so it surfaces as no-data
            // rather than a formatted zero.
            const rawValue = pointField === "target" && point["isNullTarget"] ? null : point[pointField];

            if (rawValue != null && format) {
                const { formattedValue } = ClientFormatterFacade.formatValue(rawValue, format, separators);
                values[`metric/${ldmId}`] = formattedValue;
            } else if (rawValue != null) {
                values[`metric/${ldmId}`] = String(rawValue);
            }
        }
    }

    return values;
}

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
 * @param values - Lookup of `metric/id` and `label/id` keys to formatted values
 * @param fallbackText - Localized text shown when a reference is recognized but
 *   no value is available (unknown identifier, point with no value, etc.).
 */
export function resolveReferences(content: string, values: IResolvedValues, fallbackText: string): string {
    if (!content) {
        return "";
    }

    return content.replace(REFERENCE_REGEX_MATCH, (_fullMatch, _wrapped, _key, prefix, identifier) => {
        // Regex matches the prefix case-insensitively; storage uses lowercase
        // prefixes. LDM identifiers stay as-is — they are case-sensitive.
        const value = values[`${prefix.toLowerCase()}/${identifier}`];
        return escapeMarkdownMetachars(value === undefined ? fallbackText : value);
    });
}
