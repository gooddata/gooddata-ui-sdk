// (C) 2019-2020 GoodData Corporation
import { IBucketOfFun } from "../interfaces/Visualization";

// Buckets
export const FILTERS = "filters";

export const SHOW_IN_PERCENT = "showInPercent";
export const SHOW_ON_SECONDARY_AXIS = "showOnSecondaryAxis";

export const GRANULARITY = {
    date: "GDC.time.date",
    week: "GDC.time.week_us",
    month: "GDC.time.month",
    quarter: "GDC.time.quarter",
    year: "GDC.time.year",
};
export const ALL_TIME = "all_time";

export const BUCKETS = "buckets";
export const MEASUREGROUP = "measureGroup";

// Types
export const METRIC = "metric";
export const FACT = "fact";
export const DATE = "date";
export const ATTRIBUTE = "attribute";
export const GEO_ATTRIBUTE = "geo_attribute";

export const DEFAULT_BUCKETS: IBucketOfFun[] = [];
