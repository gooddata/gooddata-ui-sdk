// (C) 2026 GoodData Corporation

import { getISOWeeksInYear, isValid, parse } from "date-fns";

import type { DateRangeParameterGranularity } from "@gooddata/sdk-model";

/** Period granularities as YAML spells them, the same as the backend and the parameters API. */
export const periodGranularities = [
    "YEAR",
    "QUARTER",
    "MONTH",
    "WEEK",
    "DAY",
    "HOUR",
    "MINUTE",
    "SECOND",
] as const;

export type PeriodGranularity = (typeof periodGranularities)[number];

const MODEL_GRANULARITY = {
    YEAR: "GDC.time.year",
    QUARTER: "GDC.time.quarter",
    MONTH: "GDC.time.month",
    WEEK: "GDC.time.week",
    DAY: "GDC.time.date",
    HOUR: "GDC.time.hour",
    MINUTE: "GDC.time.minute",
    SECOND: "GDC.time.second",
} as const satisfies Record<PeriodGranularity, DateRangeParameterGranularity>;

const PERIOD_GRANULARITY = {
    "GDC.time.year": "YEAR",
    "GDC.time.quarter": "QUARTER",
    "GDC.time.month": "MONTH",
    "GDC.time.week": "WEEK",
    "GDC.time.date": "DAY",
    "GDC.time.hour": "HOUR",
    "GDC.time.minute": "MINUTE",
    "GDC.time.second": "SECOND",
} as const satisfies Record<DateRangeParameterGranularity, PeriodGranularity>;

export function toModelGranularity(granularity: PeriodGranularity): DateRangeParameterGranularity {
    return MODEL_GRANULARITY[granularity];
}

export function toPeriodGranularity(granularity: DateRangeParameterGranularity): PeriodGranularity {
    return PERIOD_GRANULARITY[granularity];
}

/** How a `from` or `to` of each granularity is written, as the backend expects it. */
export const periodLiteralFormats = {
    YEAR: { format: "YYYY", example: "2025" },
    QUARTER: { format: "YYYY-Q", example: "2025-3" },
    MONTH: { format: "YYYY-MM", example: "2025-08" },
    WEEK: { format: "YYYY-WW", example: "2025-33" },
    DAY: { format: "YYYY-MM-DD", example: "2025-08-14" },
    HOUR: { format: "YYYY-MM-DD HH", example: "2025-08-14 13" },
    MINUTE: { format: "YYYY-MM-DD HH:mm", example: "2025-08-14 13:30" },
    SECOND: { format: "YYYY-MM-DD HH:mm:ss", example: "2025-08-14 13:30:45" },
} satisfies Record<PeriodGranularity, { format: string; example: string }>;

// The backend's patterns; every literal is fixed-width and zero-padded, so text order is time order.
const LITERAL_PATTERNS: Record<PeriodGranularity, RegExp> = {
    YEAR: /^\d{4}$/,
    QUARTER: /^\d{4}-[1-4]$/,
    MONTH: /^\d{4}-(0[1-9]|1[0-2])$/,
    WEEK: /^(?<year>\d{4})-(?<week>0[1-9]|[1-4]\d|5[0-3])$/,
    DAY: /^(?<day>\d{4}-\d{2}-\d{2})$/,
    HOUR: /^(?<day>\d{4}-\d{2}-\d{2}) ([01]\d|2[0-3])$/,
    MINUTE: /^(?<day>\d{4}-\d{2}-\d{2}) ([01]\d|2[0-3]):[0-5]\d$/,
    SECOND: /^(?<day>\d{4}-\d{2}-\d{2}) ([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
};

const REFERENCE_DATE = new Date(0);

/** Tests a literal against its granularity's format and the calendar (`2025-02-30` and `2021-53` fail). */
export function isValidPeriodLiteral(granularity: PeriodGranularity, literal: string): boolean {
    const match = LITERAL_PATTERNS[granularity].exec(literal);
    if (!match) {
        return false;
    }
    const { year, week, day }: Partial<Record<string, string>> = match.groups ?? {};
    if (year !== undefined && week !== undefined) {
        // Mid-year, since early January can belong to the previous ISO week-year.
        return Number(week) <= getISOWeeksInYear(parse(`${year}-06-15`, "yyyy-MM-dd", REFERENCE_DATE));
    }
    // Only the date is parsed: parsing a local time of day would shift it across a daylight saving gap.
    return day === undefined || isValid(parse(day, "yyyy-MM-dd", REFERENCE_DATE));
}

/** Tests that a period's `from` is not after its `to`; a missing end leaves the period open. */
export function isPeriodInOrder(from: string | undefined, to: string | undefined): boolean {
    return from === undefined || to === undefined || from <= to;
}
