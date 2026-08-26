// (C) 2026 GoodData Corporation

import moment, { type Moment } from "moment";

import { type DateFilterGranularity, type DateString, type WeekStart } from "@gooddata/sdk-model";

import { platformDateFormat } from "../constants/Platform.js";

/**
 * Static (absolute) date filter granularities supported by the period-boundary resolution utilities
 * in this module: day and standard-calendar week/month/quarter/year.
 * @alpha
 */
export type StaticPeriodGranularity = Extract<
    DateFilterGranularity,
    "GDC.time.date" | "GDC.time.week_us" | "GDC.time.month" | "GDC.time.quarter" | "GDC.time.year"
>;

const STATIC_PERIOD_GRANULARITIES: StaticPeriodGranularity[] = [
    "GDC.time.date",
    "GDC.time.week_us",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

function assertStaticPeriodGranularity(
    granularity: DateFilterGranularity,
): asserts granularity is StaticPeriodGranularity {
    if (!STATIC_PERIOD_GRANULARITIES.includes(granularity as StaticPeriodGranularity)) {
        throw new Error(
            `Unsupported static period granularity: ${granularity}. Expected one of ${STATIC_PERIOD_GRANULARITIES.join(", ")}.`,
        );
    }
}

// moment's own week-start is driven by the globally mutable current locale, which this module must not
// depend on. moment().day() is locale-independent (always 0 = Sunday .. 6 = Saturday), so week boundaries
// are computed from it directly using the caller-supplied weekStart instead.
function startOfWeek(date: Moment, weekStart: WeekStart): Moment {
    const weekStartDay = weekStart === "Monday" ? 1 : 0;
    const diff = (date.day() - weekStartDay + 7) % 7;
    return date.clone().subtract(diff, "days").startOf("day");
}

function endOfWeek(date: Moment, weekStart: WeekStart): Moment {
    return startOfWeek(date, weekStart).add(6, "days").endOf("day");
}

function startOfPeriod(granularity: StaticPeriodGranularity, date: Moment, weekStart: WeekStart): Moment {
    switch (granularity) {
        case "GDC.time.week_us":
            return startOfWeek(date, weekStart);
        case "GDC.time.month":
            return date.clone().startOf("month");
        case "GDC.time.quarter":
            return date.clone().startOf("quarter");
        case "GDC.time.year":
            return date.clone().startOf("year");
        default: // GDC.time.date
            return date.clone().startOf("day");
    }
}

function endOfPeriod(granularity: StaticPeriodGranularity, date: Moment, weekStart: WeekStart): Moment {
    switch (granularity) {
        case "GDC.time.week_us":
            return endOfWeek(date, weekStart);
        case "GDC.time.month":
            return date.clone().endOf("month");
        case "GDC.time.quarter":
            return date.clone().endOf("quarter");
        case "GDC.time.year":
            return date.clone().endOf("year");
        default: // GDC.time.date
            return date.clone().endOf("day");
    }
}

/**
 * A resolved day-level absolute date range.
 * @alpha
 */
export interface IResolvedStaticPeriodRange {
    from: DateString;
    to: DateString;
}

/**
 * Resolves a selected static granularity + period anchor range into a day-level `{from, to}` pair.
 *
 * @remarks
 * `periodStart`/`periodEnd` are any date falling within the first/last selected period of `granularity`
 * (e.g. any day in March 2026 identifies "March 2026"). The result spans from the first day of the period
 * containing `periodStart` to the last day of the period containing `periodEnd`, covering every whole
 * period in between — e.g. a `periodStart` in Feb 2026 and `periodEnd` in Apr 2026 resolves to
 * `{from: "2026-02-01", to: "2026-04-30"}`.
 *
 * @param granularity - one of `GDC.time.date` / `week_us` / `month` / `quarter` / `year` (standard calendar
 * only); throws for any other granularity, e.g. fiscal variants.
 * @param periodStart - any date within the first selected period
 * @param periodEnd - any date within the last selected period
 * @param weekStart - which day a week starts on; only relevant for `GDC.time.week_us`. Defaults to "Sunday".
 * @alpha
 */
export function resolvePeriodBoundaries(
    granularity: DateFilterGranularity,
    periodStart: DateString,
    periodEnd: DateString,
    weekStart: WeekStart = "Sunday",
): IResolvedStaticPeriodRange {
    assertStaticPeriodGranularity(granularity);

    const from = startOfPeriod(granularity, moment(periodStart, platformDateFormat), weekStart);
    const to = endOfPeriod(granularity, moment(periodEnd, platformDateFormat), weekStart);

    return {
        from: from.format(platformDateFormat),
        to: to.format(platformDateFormat),
    };
}
