// (C) 2019-2020 GoodData Corporation

/**
 * Date dataset attribute granularities.
 *
 * NOTE: This type enumerates all potentially supported granularities - implementations of analytical backend
 * MAY support only a subset of the granularities.
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
    | "GDC.time.date";
