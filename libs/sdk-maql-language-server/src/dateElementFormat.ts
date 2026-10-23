// (C) 2026 GoodData Corporation

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

/**
 * Value patterns the backend expects for date attribute elements used in MAQL, per granularity.
 *
 * Mirrors the backend (gdc-nas) implementation, which is the source of truth:
 * - patterns: `libraries/calq/calcique-lib/src/main/kotlin/generator/model/date/GregorianChronological.kt`
 *   and `FiscalChronological.kt` (`pattern` of each granularity object)
 * - regex derivation: `Chronological.valueRegex` in `.../generator/model/date/Chronological.kt`
 * - check: `TypeHandler.checkDateFormat` in `libraries/calq/calcique-lib/src/main/kotlin/interpreter/TypeHandler.kt`
 *
 * The backend regex is deliberately loose (e.g. month `[01]?\d` accepts "13"), and this check must accept
 * exactly the same values, otherwise the editor would reject expressions the backend accepts.
 * Any change on the backend side has to be aligned here manually.
 *
 * Periodical granularities (day of week, month of year, ...) are validated by the backend as integer ranges
 * that partly depend on the workspace configuration; they are not checked here and rely on the backend
 * error returned by the elements query instead.
 */
const granularityPatterns: Partial<Record<DateAttributeGranularity, string>> = {
    "GDC.time.second": "YYYY-MM-DD HH24:MI:SS",
    "GDC.time.minute": "YYYY-MM-DD HH24:MI",
    "GDC.time.hour": "YYYY-MM-DD HH24",
    "GDC.time.date": "YYYY-MM-DD",
    "GDC.time.week_us": "IYYY-IW",
    "GDC.time.month": "YYYY-MM",
    "GDC.time.quarter": "YYYY-Q",
    "GDC.time.year": "YYYY",
    "GDC.time.fiscal_month": "YYYY-MM",
    "GDC.time.fiscal_quarter": "YYYY-Q",
    "GDC.time.fiscal_year": "YYYY",
};

// Same replacement order as Chronological.valueRegex on the backend
const patternTokens: [string, string][] = [
    ["YYYY", "(\\d{1,4})"],
    ["IYYY", "(\\d{1,4})"],
    ["Q", "([1-4])"],
    ["MM", "([01]?\\d)"],
    ["IW", "([0-5]?\\d)"],
    ["DD", "([0-3]?\\d)"],
    ["HH24", "([0-2]?\\d)"],
    ["MI", "([0-5]?\\d)"],
    ["SS", "([0-5]?\\d)"],
];

const granularityRegexes = new Map<string, RegExp>(
    Object.entries(granularityPatterns).map(([granularity, pattern]) => [
        granularity,
        new RegExp(
            `^${patternTokens.reduce((regex, [token, replacement]) => regex.replaceAll(token, replacement), pattern)}$`,
        ),
    ]),
);

/**
 * Checks that the value of a date attribute element has the format the backend expects for the granularity.
 *
 * @returns the expected pattern when the value does not match it, undefined when the value is valid
 *  or the granularity is not checked
 */
export function getInvalidDateElementPattern(
    value: string,
    granularity: DateAttributeGranularity | undefined,
): string | undefined {
    if (!granularity || value === "") {
        return undefined; // the backend considers an empty string to be NULL for dates
    }
    const regex = granularityRegexes.get(granularity);
    return regex && !regex.test(value) ? granularityPatterns[granularity] : undefined;
}
