// (C) 2019-2022 GoodData Corporation

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
    | "GDC.time.week_us"
    | "GDC.time.week_in_year"
    | "GDC.time.week_in_quarter"
    | "GDC.time.week"
    | "GDC.time.euweek_in_year"
    | "GDC.time.euweek_in_quarter"
    | "GDC.time.quarter"
    | "GDC.time.quarter_in_year"
    | "GDC.time.month"
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
    | "GDC.time.minute_in_hour";

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
