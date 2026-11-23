// (C) 2019-2026 GoodData Corporation

/**
 * All possible date dataset attribute granularities.
 *
 * @remarks
 * NOTE: Implementations of analytical backend MAY support only a subset of these granularities.
 *
 * See {@link DateGranularity} for a more convenient way to access commonly used granularities.
 *
 * @public
 */
export type DateAttributeGranularity =
    | "GDC.time.year"
    | "GDC.time.fiscal_year"
    | "GDC.time.week_us"
    | "GDC.time.week_in_year"
    | "GDC.time.week_in_quarter"
    | "GDC.time.week"
    | "GDC.time.euweek_in_year"
    | "GDC.time.euweek_in_quarter"
    | "GDC.time.quarter"
    | "GDC.time.fiscal_quarter"
    | "GDC.time.quarter_in_year"
    | "GDC.time.month"
    | "GDC.time.fiscal_month"
    | "GDC.time.month_in_quarter"
    | "GDC.time.month_in_year"
    | "GDC.time.day_in_year"
    | "GDC.time.day_in_quarter"
    | "GDC.time.day_in_month"
    | "GDC.time.day_in_week"
    | "GDC.time.day_in_euweek"
    | "GDC.time.date"
    | "GDC.time.hour"
    | "GDC.time.hour_in_day"
    | "GDC.time.minute"
    | "GDC.time.minute_in_hour"
    | "GDC.time.minute_in_day"
    | "GDC.time.second"
    | "GDC.time.second_in_minute"
    | "GDC.time.second_in_day";

/**
 * Date granularities whose periods an {@link IAbsoluteGranularityDateFilter} can select: week, month,
 * quarter and year.
 *
 * @remarks
 * Weeks are numbered as described in {@link DatePeriodLiteral}.
 *
 * @public
 */
export type DatePeriodGranularity = "GDC.time.week" | "GDC.time.month" | "GDC.time.quarter" | "GDC.time.year";

/**
 * One period of a {@link DatePeriodGranularity}, in the format of that granularity.
 *
 * @remarks
 * - week: 'YYYY-WW', where 'WW' is the zero-padded ISO-8601 week number, for example '2026-05'
 * - month: 'YYYY-MM', for example '2026-03'
 * - quarter: 'YYYY-Q', for example '2026-1'
 * - year: 'YYYY', for example '2026'
 *
 * A week literal uses the ISO-8601 week number and the ISO-8601 week-numbering year. Week 53 is valid only
 * in the years that have it. The days of the week depend on the week start: with a Monday start it is the
 * ISO-8601 week from Monday to Sunday, with a Sunday start the same week shifted one day earlier, from Sunday
 * to Saturday.
 *
 * @public
 */
export type DatePeriodLiteral = string;

/**
 * A range of periods of a {@link DatePeriodGranularity} with at least one edge set.
 *
 * @remarks
 * 'from' is the first and 'to' the last period of the range, both included. A missing edge leaves the range
 * open on that side.
 *
 * @public
 */
export type DatePeriodRange =
    | { from: DatePeriodLiteral; to?: DatePeriodLiteral }
    | { from?: DatePeriodLiteral; to: DatePeriodLiteral };

/**
 * Special granularity used to indicate there should be no date filtering for the given dimension.
 *
 * @public
 */
export type AllTimeGranularity = "ALL_TIME_GRANULARITY";

/**
 * Defines shortcuts for commonly used date dataset attribute granularities.
 *
 * @public
 */
export const DateGranularity: { [short: string]: DateAttributeGranularity } = {
    date: "GDC.time.date",
    week: "GDC.time.week_us",
    month: "GDC.time.month",
    quarter: "GDC.time.quarter",
    year: "GDC.time.year",
};
