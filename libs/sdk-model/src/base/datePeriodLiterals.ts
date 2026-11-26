// (C) 2026 GoodData Corporation

import { type DateRangeParameterGranularity } from "../ldm/metadata/parameter/index.js";

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

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function daysInMonth(year: number, month: number): number {
    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return month === 2 && isLeapYear ? 29 : DAYS_IN_MONTH[month - 1];
}

// The numbers of a literal from the year down, so comparing them in order compares the periods.
type PeriodParts = readonly number[];

const isDay = ([year, month, day]: PeriodParts): boolean =>
    month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);

const isTime = ([year, month, day, hour, minute = 0, second = 0]: PeriodParts): boolean =>
    isDay([year, month, day]) && hour <= 23 && minute <= 59 && second <= 59;

const PERIOD_FORMATS: Record<
    DateRangeParameterGranularity,
    { pattern: RegExp; isValid: (parts: PeriodParts) => boolean }
> = {
    "GDC.time.year": { pattern: /^(\d{4})$/, isValid: () => true },
    "GDC.time.quarter": { pattern: /^(\d{4})-(\d)$/, isValid: ([, quarter]) => quarter >= 1 && quarter <= 4 },
    "GDC.time.month": { pattern: /^(\d{4})-(\d{2})$/, isValid: ([, month]) => month >= 1 && month <= 12 },
    "GDC.time.week": {
        pattern: /^(\d{4})-(\d{2})$/,
        isValid: ([year, week]) => week >= 1 && week <= isoWeeksInYear(year),
    },
    "GDC.time.date": { pattern: /^(\d{4})-(\d{2})-(\d{2})$/, isValid: isDay },
    "GDC.time.hour": { pattern: /^(\d{4})-(\d{2})-(\d{2}) (\d{2})$/, isValid: isTime },
    "GDC.time.minute": { pattern: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/, isValid: isTime },
    "GDC.time.second": { pattern: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, isValid: isTime },
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
    granularity: DatePeriodGranularity | DateRangeParameterGranularity,
    literal: unknown,
): PeriodParts | undefined {
    if (typeof literal !== "string") {
        return undefined;
    }

    const { pattern, isValid } = PERIOD_FORMATS[granularity];
    const match = pattern.exec(literal);
    if (!match) {
        return undefined;
    }

    const parts = match.slice(1).map(Number);
    return isValid(parts) ? parts : undefined;
}

function comparePeriods(a: PeriodParts, b: PeriodParts): number {
    const index = a.findIndex((part, i) => part !== b[i]);
    return index === -1 ? 0 : a[index] - b[index];
}

/**
 * Tells whether the literal is one period in the format of the granularity.
 *
 * @remarks
 * A week is accepted up to the number of ISO-8601 weeks in its year, 52 or 53.
 *
 * The granularities of a date range parameter are accepted too, in the formats described in
 * {@link IDateRangeParameterPeriod}. A day, hour, minute or second must exist in the calendar.
 *
 * @alpha
 */
export function isValidDatePeriodLiteral(
    granularity: DatePeriodGranularity | DateRangeParameterGranularity,
    literal: unknown,
): boolean {
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
    granularity: DatePeriodGranularity | DateRangeParameterGranularity,
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
    granularity: DatePeriodGranularity | DateRangeParameterGranularity,
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
