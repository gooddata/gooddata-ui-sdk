// (C) 2026 GoodData Corporation

import {
    addDays,
    addWeeks,
    endOfMonth,
    endOfQuarter,
    endOfYear,
    format,
    isValid,
    parse,
    startOfISOWeek,
} from "date-fns";

import {
    type DatePeriodGranularity,
    type DatePeriodLiteral,
    type DateString,
    type WeekStart,
    isValidDatePeriodLiteral,
} from "@gooddata/sdk-model";

import { platformDateFnsFormat } from "../constants/Platform.js";

const LITERAL_FORMATS: Record<Exclude<DatePeriodGranularity, "GDC.time.week">, string> = {
    "GDC.time.month": "yyyy-MM",
    "GDC.time.quarter": "yyyy-Q",
    "GDC.time.year": "yyyy",
};

// A week starting on Sunday is the ISO-8601 week of its Monday shifted one day earlier.
const weekStartShift = (weekStart: WeekStart): number => (weekStart === "Monday" ? 0 : 1);

function parseDay(day: DateString): Date | undefined {
    const date = parse(day.slice(0, 10), platformDateFnsFormat, new Date());
    return isValid(date) ? date : undefined;
}

/**
 * The literal of the period that contains the day.
 */
export function dateToPeriodLiteral(
    granularity: DatePeriodGranularity,
    date: Date,
    weekStart: WeekStart,
): DatePeriodLiteral {
    if (granularity === "GDC.time.week") {
        return format(addDays(date, weekStartShift(weekStart)), "RRRR-II");
    }

    return format(date, LITERAL_FORMATS[granularity]);
}

/**
 * The literal of the period that contains the day, undefined for a day that is not valid.
 */
export function dayToPeriodLiteral(
    granularity: DatePeriodGranularity,
    day: DateString | undefined,
    weekStart: WeekStart,
): DatePeriodLiteral | undefined {
    const date = day ? parseDay(day) : undefined;
    return date ? dateToPeriodLiteral(granularity, date, weekStart) : undefined;
}

/**
 * The first day of the period, undefined for a literal that is not valid.
 */
export function periodLiteralToFirstDate(
    granularity: DatePeriodGranularity,
    literal: DatePeriodLiteral | undefined,
    weekStart: WeekStart,
): Date | undefined {
    if (!literal || !isValidDatePeriodLiteral(granularity, literal)) {
        return undefined;
    }

    if (granularity === "GDC.time.week") {
        const [year, week] = literal.split("-").map(Number);
        // January 4th is always in the first ISO-8601 week of its year.
        const firstWeek = startOfISOWeek(new Date(year, 0, 4));
        return addDays(addWeeks(firstWeek, week - 1), -weekStartShift(weekStart));
    }

    const date = parse(literal, LITERAL_FORMATS[granularity], new Date());
    return isValid(date) ? date : undefined;
}

/**
 * The last day of the period, undefined for a literal that is not valid.
 */
export function periodLiteralToLastDate(
    granularity: DatePeriodGranularity,
    literal: DatePeriodLiteral | undefined,
    weekStart: WeekStart,
): Date | undefined {
    const first = periodLiteralToFirstDate(granularity, literal, weekStart);
    if (!first) {
        return undefined;
    }

    switch (granularity) {
        case "GDC.time.week":
            return addDays(first, 6);
        case "GDC.time.month":
            return endOfMonth(first);
        case "GDC.time.quarter":
            return endOfQuarter(first);
        case "GDC.time.year":
            return endOfYear(first);
    }
}

/**
 * The first day of the period in the platform format, undefined for a literal that is not valid.
 */
export function periodLiteralToFirstDay(
    granularity: DatePeriodGranularity,
    literal: DatePeriodLiteral | undefined,
    weekStart: WeekStart,
): DateString | undefined {
    const date = periodLiteralToFirstDate(granularity, literal, weekStart);
    return date ? format(date, platformDateFnsFormat) : undefined;
}

/**
 * The last day of the period in the platform format, undefined for a literal that is not valid.
 */
export function periodLiteralToLastDay(
    granularity: DatePeriodGranularity,
    literal: DatePeriodLiteral | undefined,
    weekStart: WeekStart,
): DateString | undefined {
    const date = periodLiteralToLastDate(granularity, literal, weekStart);
    return date ? format(date, platformDateFnsFormat) : undefined;
}
