// (C) 2026 GoodData Corporation

import { type DatePeriodGranularity, type DatePeriodLiteral } from "./dateGranularities.js";

const DATE_PERIOD_GRANULARITIES: readonly DatePeriodGranularity[] = [
    "GDC.time.week",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

// Day of the week of December 31, 0 is Sunday. Date is not used because it maps years 0 to 99 to 1900 to 1999.
function dayOfWeekOfLastDay(year: number): number {
    const day = year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400);
    return ((day % 7) + 7) % 7;
}

// An ISO-8601 week-numbering year has 53 weeks when it ends on a Thursday or the year before ends on a Wednesday.
function isoWeeksInYear(year: number): number {
    return dayOfWeekOfLastDay(year) === 4 || dayOfWeekOfLastDay(year - 1) === 3 ? 53 : 52;
}

const PERIOD_FORMATS: Record<DatePeriodGranularity, { pattern: RegExp; maxIndex: (year: number) => number }> =
    {
        "GDC.time.week": { pattern: /^(\d{4})-(\d{2})$/, maxIndex: isoWeeksInYear },
        "GDC.time.month": { pattern: /^(\d{4})-(\d{2})$/, maxIndex: () => 12 },
        "GDC.time.quarter": { pattern: /^(\d{4})-(\d)$/, maxIndex: () => 4 },
        "GDC.time.year": { pattern: /^(\d{4})$/, maxIndex: () => 0 },
    };

/**
 * Type guard checking whether the provided value is a {@link DatePeriodGranularity}.
 *
 * @alpha
 */
export function isDatePeriodGranularity(value: unknown): value is DatePeriodGranularity {
    return DATE_PERIOD_GRANULARITIES.some((granularity) => granularity === value);
}

function parseDatePeriodLiteral(
    granularity: DatePeriodGranularity,
    literal: unknown,
): { year: number; index: number } | undefined {
    if (typeof literal !== "string") {
        return undefined;
    }

    const { pattern, maxIndex } = PERIOD_FORMATS[granularity];
    const match = pattern.exec(literal);
    if (!match) {
        return undefined;
    }

    const year = Number(match[1]);
    const index = match[2] === undefined ? 0 : Number(match[2]);
    const lastIndex = maxIndex(year);
    if (lastIndex > 0 && (index < 1 || index > lastIndex)) {
        return undefined;
    }

    return { year, index };
}

function comparePeriods(a: { year: number; index: number }, b: { year: number; index: number }): number {
    return a.year - b.year || a.index - b.index;
}

/**
 * Tells whether the literal is one period in the format of the granularity.
 *
 * @remarks
 * A week is accepted up to the number of ISO-8601 weeks in its year, 52 or 53.
 *
 * @alpha
 */
export function isValidDatePeriodLiteral(granularity: DatePeriodGranularity, literal: unknown): boolean {
    return parseDatePeriodLiteral(granularity, literal) !== undefined;
}

/**
 * Compares two valid period literals of the same granularity.
 *
 * @returns a negative number when 'a' is earlier than 'b', zero when they are the same period and a positive
 *  number when 'a' is later than 'b'
 * @alpha
 */
export function compareDatePeriodLiterals(
    granularity: DatePeriodGranularity,
    a: DatePeriodLiteral,
    b: DatePeriodLiteral,
): number {
    const first = parseDatePeriodLiteral(granularity, a);
    const second = parseDatePeriodLiteral(granularity, b);
    if (!first || !second) {
        throw new Error(`Not ${granularity} literals: ${a}, ${b}`);
    }

    return comparePeriods(first, second);
}

/**
 * Tells whether 'from' and 'to' form a valid range of periods of the granularity.
 *
 * @remarks
 * At least one of 'from' and 'to' must be set, each one that is set must be a valid literal, and 'from' must
 * not be after 'to' when both are set.
 *
 * @alpha
 */
export function isValidDatePeriodRange(
    granularity: DatePeriodGranularity,
    from: unknown,
    to: unknown,
): boolean {
    if (from === undefined && to === undefined) {
        return false;
    }

    const first = from === undefined ? undefined : parseDatePeriodLiteral(granularity, from);
    const last = to === undefined ? undefined : parseDatePeriodLiteral(granularity, to);
    if ((from !== undefined && !first) || (to !== undefined && !last)) {
        return false;
    }

    return !first || !last || comparePeriods(first, last) <= 0;
}
