// (C) 2019 GoodData Corporation
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

// (C) 2007-2019 GoodData Corporation

export type GranularityIntlKey = "day" | "week" | "month" | "quarter" | "year";

export const granularityIntlCodes: {
    [key in ExtendedDateFilters.DateFilterGranularity]: GranularityIntlKey;
} = {
    "GDC.time.date": "day",
    "GDC.time.week_us": "week",
    "GDC.time.month": "month",
    "GDC.time.quarter": "quarter",
    "GDC.time.year": "year",
};
