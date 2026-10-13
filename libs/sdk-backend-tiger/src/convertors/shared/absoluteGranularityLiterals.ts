// (C) 2026 GoodData Corporation

import { endOfMonth, endOfQuarter, endOfYear, isValid } from "date-fns";

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

import { parseDateValue, serializeDateValue } from "../fromBackend/dateFormatting/dateValueParser.js";

// TODO: a week has no literal yet, because the backend numbers weeks by ISO-8601 and shifts them by the
// week start; support will be added later in a different PR.
const WIRE_ABSOLUTE_GRANULARITIES = [
    "GDC.time.date",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
] as const satisfies readonly DateAttributeGranularity[];

/**
 * Granularities an absolute date filter can express on the wire as a period literal.
 */
export type WireAbsoluteGranularity = (typeof WIRE_ABSOLUTE_GRANULARITIES)[number];

/**
 * Granularities whose ranges can be sent as period literals rather than as days.
 */
export type PeriodLiteralGranularity = Exclude<WireAbsoluteGranularity, "GDC.time.date">;

export function isWireAbsoluteGranularity(
    granularity: DateAttributeGranularity | undefined,
): granularity is WireAbsoluteGranularity {
    return WIRE_ABSOLUTE_GRANULARITIES.some((wireGranularity) => wireGranularity === granularity);
}

/**
 * Tells whether an absolute date filter at the granularity can be sent as period literals rather than
 * as its days.
 */
export function hasPeriodLiteral(
    granularity: DateAttributeGranularity | undefined,
): granularity is PeriodLiteralGranularity {
    return isWireAbsoluteGranularity(granularity) && granularity !== "GDC.time.date";
}

function isDay(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseDateValue(value, "GDC.time.date"));
}

function parseDay(day: string): Date {
    if (!isDay(day)) {
        throw new Error(`Not a day in the YYYY-MM-DD format: ${day}`);
    }

    return parseDateValue(day, "GDC.time.date");
}

function serializeDay(date: Date): string {
    return serializeDateValue(date, "GDC.time.date");
}

/**
 * Converts a day into the literal of the period of the given granularity that contains it.
 */
export function toPeriodLiteral(granularity: WireAbsoluteGranularity, day: string): string {
    return serializeDateValue(parseDay(day), granularity);
}

/**
 * Converts a period literal into the first and the last day of that period.
 */
export function fromPeriodLiteral(
    granularity: WireAbsoluteGranularity,
    literal: string,
): { first: string; last: string } {
    const first = parseDateValue(literal, granularity);
    if (!isValid(first)) {
        throw new Error(`Not a ${granularity} literal: ${literal}`);
    }

    let last = first;
    switch (granularity) {
        case "GDC.time.month":
            last = endOfMonth(first);
            break;
        case "GDC.time.quarter":
            last = endOfQuarter(first);
            break;
        case "GDC.time.year":
            last = endOfYear(first);
            break;
    }

    return {
        first: serializeDay(first),
        last: serializeDay(last),
    };
}

/**
 * Converts a range of days into the literals of its first and last period of the given granularity.
 *
 * @returns undefined when a day is not in the YYYY-MM-DD format or the range is not whole periods
 */
export function toWholePeriodLiterals(
    granularity: PeriodLiteralGranularity,
    from: string,
    to: string,
): { from: string; to: string } | undefined {
    if (!isDay(from) || !isDay(to)) {
        return undefined;
    }

    const literals = {
        from: toPeriodLiteral(granularity, from),
        to: toPeriodLiteral(granularity, to),
    };
    const isWhole =
        from <= to &&
        fromPeriodLiteral(granularity, literals.from).first === from &&
        fromPeriodLiteral(granularity, literals.to).last === to;

    return isWhole ? literals : undefined;
}
